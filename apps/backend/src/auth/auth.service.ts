import { blood_type, Prisma } from "@prisma/client";
import { prisma } from "../core/database";
import generateUsername from "../helpers/generateUsername";
import { PasswordHash } from "./helpers/password-hash.helper";
import { Token } from "./helpers/token.helper";

export type UserCreateDTO = {
  firstName: any;
  lastName: any;
  email: string;
  blood: blood_type;
  password: string;
};

export class AuthService {
  constructor(
    private readonly hash: PasswordHash = new PasswordHash(),
    private readonly user: Prisma.UserDelegate = prisma.user,
    private readonly profile: Prisma.ProfileDelegate = prisma.profile,
    private readonly otpRecords: Prisma.OtpRecordsDelegate = prisma.otpRecords,
    private readonly role: Prisma.RoleDelegate = prisma.role
  ) {}

  async signIn(username: string, password: string) {
    const findUser = await this.findOne({
      OR: [{ username }, { email: username }],
    });

    if (!findUser) {
      // todo throw new error
      // return res.status(400).json(errorMessage);
      return;
    }

    const isPasswordOk = this.hash.verify(password, findUser.password);

    if (!isPasswordOk) {
      // todo throw new error
      // return res.status(400).json(errorMessage);
      return;
    }
    if (!findUser.isVerified) {
      // return res.status(406).json({
      //   message:
      //     "You account is not yet activated! We will let you know when it activated!",
      // });
      return;
    }

    const token = Token.generate(findUser);

    return token;
  }
  async create_user(values: UserCreateDTO) {
    const { firstName, lastName, email, blood, password } = values;

    const hash = this.hash.hash(password);

    const role = await this.role.findUnique({ where: { role: "user" } });
    if (!role) {
      // return res.status(500).json({ message: "Internal server error" });
      return;
    }

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
    // Find the user in the database
    const findUser = await this.findOne({ id: userId });

    if (!findUser) {
      // return res.status(404).json({ password: "Password is incorrect!" });
      return;
    }

    // Check if the current password is correct
    const isPasswordOk = this.hash.verify(password, findUser.password);
    if (!isPasswordOk) {
      // return res.status(400).json({ password: "Password is incorrect!" });
      return;
    }

    const hashedNewPassword = this.hash.hash(newPassword);

    // Update the user's password in the database
    const user = await this.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    return user;
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

    if (!otpRecord) {
      // return res.status(406).json({ message: "Password update failed" });
      return;
    }

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
    let username = generateUsername(firstName + " " + lastName);
    while (true) {
      const data = await this.findOne({ username });
      if (!data) break;
      username = generateUsername(firstName);
    }
    return username;
  }
}
