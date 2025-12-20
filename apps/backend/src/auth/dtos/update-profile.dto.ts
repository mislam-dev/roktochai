import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class UpdateProfileDto {
  @IsNotEmpty({ message: "First name is required!" })
  @Length(1, 50)
  firstName!: string;

  @IsNotEmpty({ message: "Last name is required!" })
  @Length(1, 50)
  lastName!: string;

  @IsOptional()
  @Length(0, 50)
  displayName?: string;

  @IsOptional()
  @Length(0, 15)
  phoneNo?: string;
}
