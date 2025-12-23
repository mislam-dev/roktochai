import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import {
  HttpException,
  NotFoundException,
  ValidationException,
} from "../core/errors";
import { OtpRecordsService } from "../otp-records/otp-records.service";
import { ProfileService } from "../profile/profile.service";
import { CreateUserDto } from "../user/dtos/create-user.dto";
import { UserService } from "../user/user.service";
import { UpdateInfoDto } from "./dtos/update-info.dto";
import { PasswordHash } from "./helpers/password-hash.helper";
import { Token } from "./helpers/token.helper";

@injectable()
export class AuthService {
  constructor(
    private readonly otpRecordsService: OtpRecordsService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly hash: PasswordHash,
    private readonly token: Token
  ) {}

  async signIn(username: string, password: string) {
    const findUser = await this.userService.findOne({
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

    return this.token.generate(findUser);
  }

  async signUp(data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  async recoverAccount(userId: string, userEmail: string) {
    const otp = this.generateOtp(userId, userEmail);
    return otp;
  }

  async updatePassword(userId: string, password: string, newPassword: string) {
    const findUser = await this.userService.findOne({ id: userId });

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

    return this.userService.update(
      { id: userId },
      { password: hashedNewPassword }
    );
  }

  async me(userId: string) {
    const userData = await this.userService.findOne({ id: userId });
    if (!userData) throw new NotFoundException();
    return userData;
  }

  updateInfo(userId: string, data: UpdateInfoDto) {
    return this.userService.update({ id: userId }, data);
  }

  async updateProfile(userId: string, updateData: Prisma.ProfileUpdateInput) {
    return this.profileService.updateProfileWitUserId(userId, updateData);
  }

  async verifyOtp(otpRecordId: string) {
    const verificationId = Math.random().toString(36).substring(2, 22);
    const hash = this.hash.otpHash(verificationId);
    await this.otpRecordsService.update(
      { id: otpRecordId },
      { verificationId: hash }
    );
    return hash;
  }

  async verifyVerificationId(verificationId: string) {
    const findOtpData = await this.otpRecordsService.findOne({
      verificationId,
    });
    if (!findOtpData) throw new HttpException("Verification failed", 400);
    return findOtpData;
  }

  async setNewPassword(verificationId: string, newPassword: string) {
    const otpRecord = await this.otpRecordsService.findOne({ verificationId });

    if (!otpRecord) throw new NotFoundException();

    const hashedNewPassword = this.hash.hash(newPassword);

    await this.userService.update(
      { id: otpRecord.userId },
      { password: hashedNewPassword, forgotVerificationId: null }
    );

    await this.otpRecordsService.remove(otpRecord.id);
  }

  async generateOtp(userId: string, email: string) {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    // Send OTP via mail (pseudo-code)
    // await sendOtpEmail(user.email, otp);

    await this.otpRecordsService.create({
      otp,
      email,
      userId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 15 minutes
    });

    return otp;
  }
}
