import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { IsEmailUnique } from "../decorators/is-email-unique.decorator";
import { IsRoleValid } from "../decorators/is-role-valid.decorator";
import { BloodGroup } from "../types";

export class CreateUserDto {
  @IsNotEmpty({ message: "First Name is required!" })
  @IsString()
  firstName!: string;

  @IsNotEmpty({ message: "First Name is required!" })
  @IsString()
  phoneNo!: string;

  @IsNotEmpty({ message: "Last Name is required!" })
  @IsString()
  lastName!: string;

  @IsNotEmpty({ message: "Email is required!" })
  @IsString()
  @IsEmail({}, { message: "Invalid email format!" })
  @IsEmailUnique()
  email!: string;

  @IsNotEmpty({ message: "Blood group is required!" })
  @IsString()
  @IsEnum(BloodGroup, { message: "Invalid blood group!" })
  blood!: BloodGroup;

  @IsNotEmpty({ message: "Role is required!" })
  @IsString()
  @IsRoleValid()
  role!: string;
}
