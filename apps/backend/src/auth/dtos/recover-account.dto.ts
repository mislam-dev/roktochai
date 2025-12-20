import { IsNotEmpty, IsString } from "class-validator";
export class RecoverAccountDto {
  @IsNotEmpty({ message: "Email or Username is required" })
  @IsString()
  email!: string; // Using 'email' variable name to match your previous logic
}
