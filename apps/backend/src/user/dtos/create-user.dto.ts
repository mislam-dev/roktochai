import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Validate,
} from "class-validator";

import { PrismaClient } from "@prisma/client";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { BloodGroup } from "../types";

const prisma = new PrismaClient();

// Check if Email already exists
@ValidatorConstraint({ name: "IsEmailUnique", async: true })
export class IsEmailUniqueRule implements ValidatorConstraintInterface {
  async validate(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    return !user;
  }
  defaultMessage() {
    return "Email already exists!";
  }
}

// Check if Role ID exists
@ValidatorConstraint({ name: "IsRoleValid", async: true })
export class IsRoleValidRule implements ValidatorConstraintInterface {
  async validate(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    return !!role;
  }
  defaultMessage() {
    return "Invalid role!";
  }
}

// Find User by Username/Email and attach data to DTO
@ValidatorConstraint({ name: "UserLookup", async: true })
export class UserLookupRule implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
      select: { role: true, id: true },
    });

    if (!user) return false;

    // Attach data to the instance for use in the controller
    const obj = args.object as any;
    obj.findUserRole = user.role;
    obj.findUserId = user.id;
    return true;
  }
  defaultMessage() {
    return "User doesn't exist!";
  }
}

export class CreateUserDto {
  @IsNotEmpty({ message: "First Name is required!" })
  firstName!: string;

  @IsNotEmpty({ message: "Last Name is required!" })
  lastName!: string;

  @IsNotEmpty({ message: "Email is required!" })
  @IsEmail({}, { message: "Invalid email format!" })
  @Validate(IsEmailUniqueRule)
  email!: string;

  @IsNotEmpty({ message: "Blood group is required!" })
  @IsEnum(BloodGroup, { message: "Invalid blood group!" })
  blood!: BloodGroup;

  @IsNotEmpty({ message: "Role is required!" })
  @Validate(IsRoleValidRule)
  role!: string;
}

export class PromoteDemoteDto {
  @IsNotEmpty({ message: "User is required!" })
  @IsString()
  @Validate(UserLookupRule)
  username!: string;

  // These will be populated by UserLookupRule
  findUserRole?: any;
  findUserId?: string;
}
