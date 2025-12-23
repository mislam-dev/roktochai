import { blood_type } from "@prisma/client";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { prisma } from "../../core/database";

@ValidatorConstraint({ name: "UserExists", async: true })
export class UserExistsRule implements ValidatorConstraintInterface {
  async validate(email: string, args: ValidationArguments) {
    if (!email) return true;
    const findUser = await prisma.user.findFirst({ where: { email } });

    // Note: class-validator doesn't traditionally modify the request body
    // inside a validator. We store the result or handle it in the controller.
    if (findUser) {
      (args.object as any).emailUserId = findUser.id;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Email already exists in system.`;
  }
}

export class CreateRequestDto {
  @IsNotEmpty({ message: "First name is required!" })
  @IsString()
  firstName!: string;

  @IsNotEmpty({ message: "Last name is required!" })
  @IsString()
  lastName!: string;

  @IsOptional()
  @IsEmail({}, { message: "Email must be valid!" })
  @Validate(UserExistsRule)
  email?: string;

  @IsNotEmpty({ message: "Phone is required!" })
  phone!: string;

  @IsNotEmpty({ message: "Address is required!" })
  address!: string;

  @IsNotEmpty({ message: "Blood is required!" })
  blood!: blood_type;

  @IsNotEmpty({ message: "Reason is required!" })
  reason!: string;

  @IsNotEmpty({ message: "Date is required!" })
  date!: string;
}
