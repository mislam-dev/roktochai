import { IsNotEmpty, Length, MinLength } from "class-validator";
// import { Match } from "../decorators/match.decorator"; // Using the custom decorator created earlier

export class UpdatePasswordDto {
  @IsNotEmpty({ message: "Current password is required!" })
  @MinLength(8, { message: "Current password must be at least 8 chars" })
  password!: string;

  @IsNotEmpty({ message: "New password is required!" })
  @Length(8, 32, { message: "New password must be between 8 and 32 chars" })
  newPassword!: string;

  @IsNotEmpty({ message: "Confirm password is required!" })
  // todo @Match("newPassword", { message: "Passwords did not match" })
  confirmPassword!: string;
}
