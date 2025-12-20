import { IsEmail, Length } from "class-validator";

export class VerifyOtpDto {
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @Length(6, 6, { message: "OTP must be exactly 6 digits" })
  otp!: string;
}
