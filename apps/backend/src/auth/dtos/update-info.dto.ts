import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, Validate } from "class-validator";

import { PrismaClient } from "@prisma/client";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

const prisma = new PrismaClient();

@ValidatorConstraint({ name: "IsEmailUniqueUpdate", async: true })
export class IsEmailUniqueUpdateConstraint
  implements ValidatorConstraintInterface
{
  async validate(email: string, args: ValidationArguments) {
    // We get the current user's ID from the validation context
    const userId = (args.object as any).userId;

    if (!email) return false;

    const user = await prisma.user.findUnique({
      where: {
        email,
        isDelete: false,
        NOT: { id: userId }, // Exclude the current user
      },
    });

    return !user;
  }

  defaultMessage() {
    return "Email is already exists!";
  }
}
export class UpdateInfoDto {
  // Populated manually in middleware
  userId!: string;

  @IsNotEmpty({ message: "Email is required!" })
  @IsEmail({}, { message: "Email must be valid!" })
  @Transform(({ value }) => value?.toLowerCase().trim()) // Replaces normalizeEmail()
  @Validate(IsEmailUniqueUpdateConstraint)
  email!: string;
}
