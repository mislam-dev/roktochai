import { blood_type, Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { DBClientToken } from "../core/database/token";
import {
  HttpException,
  InternalServerException,
  NotFoundException,
  ValidationException,
} from "../core/errors";
import { PasswordHash } from "./helpers/password-hash.helper";
import { Token } from "./helpers/token.helper";

export type UserCreateDTO = {
  firstName: any;
  lastName: any;
  email: string;
  blood: blood_type;
  password: string;
};

@injectable()
export class AuthService {
  private readonly user: Prisma.UserDelegate;
  private readonly profile: Prisma.ProfileDelegate;
  private readonly otpRecords: Prisma.OtpRecordsDelegate;
  private readonly role: Prisma.RoleDelegate;
  constructor(
    private readonly hash: PasswordHash,
    @inject(DBClientToken)
    readonly prisma: PrismaClient
  ) {
    this.user = prisma.user;
    this.profile = prisma.profile;
    this.otpRecords = prisma.otpRecords;
    this.role = prisma.role;
  }

  async signIn(username: string, password: string) {
    const findUser = await this.findOne({
      OR: [{ username }, { email: username }],
    });

    const errorMessages = [
      { property: "username", constraints: ["Invalid username!"] },
      { property: "password", constraints: ["Invalid password!"] },
    ];

    if (!findUser) throw new ValidationException(errorMessages);

    const isPasswordOk = this.hash.verify(password, findUser.password);

    if (!isPasswordOk) throw new ValidationException(errorMessages);
    if (!findUser.isVerified)
      throw new HttpException(
        "You account is not yet activated! We will let you know when it activated!",
        406
      );

    return Token.generate(findUser);
  }
  async create_user(values: UserCreateDTO) {
    const { firstName, lastName, email, blood, password } = values;

    const hash = this.hash.hash(password);

    const role = await this.role.findUnique({ where: { role: "user" } });
    console.error("Role is not found on the tables");
    if (!role) throw new InternalServerException();

    let username = await this.getRandomUniqueUsername(firstName, lastName);

    const data = await this.user.create({
      data: {
        email,
        username,
        password: hash,
        roleId: role?.id,
        Profile: {
          create: {
            firstName,
            lastName,
            bloodGroup: blood,
          },
        },
      },
    });

    return data;
  }

  async generateOtp(email: string, userId: string) {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    // Send OTP via mail (pseudo-code)
    // await sendOtpEmail(user.email, otp);

    // Update OTP in the database
    // todo need otp service
    await this.otpRecords.create({
      data: {
        otp,
        email,
        userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 15 minutes
      },
    });

    return true;
  }

  async updatePassword(password: string, newPassword: string, userId: string) {
    const findUser = await this.findOne({ id: userId });

    if (!findUser) throw new NotFoundException();
    const isPasswordOk = this.hash.verify(password, findUser.password);
    if (!isPasswordOk) {
      throw new ValidationException([
        {
          property: "password",
          constraints: ["Password is incorrect!"],
        },
      ]);
    }

    const hashedNewPassword = this.hash.hash(newPassword);

    return this.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  // private methods
  findOne(options: Prisma.UserFindManyArgs["where"]) {
    return this.user.findFirst({
      where: options,
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.user.update({
      where: { id },
      data,
    });
  }

  async updateProfile(userId: string, updateData: Prisma.ProfileUpdateInput) {
    return this.profile.update({
      where: { userId },
      data: updateData,
    });
  }

  async verifyOtp(otpRecordId: string) {
    const verificationId = Math.random().toString(36).substring(2, 22);
    const hash = this.hash.otpHash(verificationId);
    await this.otpRecords.update({
      where: { id: otpRecordId },
      data: {
        verificationId: hash,
      },
    });
    return hash;
  }

  findOtpRecord(verificationId: string) {
    return this.otpRecords.findFirst({
      where: {
        verificationId,
      },
    });
  }

  async setNewPassword(verificationId: string, newPassword: string) {
    const otpRecord = await this.otpRecords.findFirst({
      where: { verificationId },
    });

    if (!otpRecord) throw new NotFoundException();

    const hashedNewPassword = this.hash.hash(newPassword);

    await this.user.update({
      where: { id: otpRecord.userId },
      data: { password: hashedNewPassword, forgotVerificationId: null },
    });

    await this.otpRecords.delete({
      where: {
        id: otpRecord.id,
      },
    });
  }

  private async getRandomUniqueUsername(firstName: string, lastName: string) {
    let username = this.generateUsername(firstName + " " + lastName);
    while (true) {
      const data = await this.findOne({ username });
      if (!data) break;
      username = this.generateUsername(firstName);
    }
    return username;
  }

  generateUsername(name: string) {
    // Generate a random number between 1000 and 9999
    const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    // Concatenate the name and random number
    const username = `${name}${randomNumber}`;

    return username.replace(" ", "_");
  }
}
