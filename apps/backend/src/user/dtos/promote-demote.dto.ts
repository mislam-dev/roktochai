import { IsNotEmpty, IsString, Validate } from "class-validator";

import { PrismaClient } from "@prisma/client";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

const prisma = new PrismaClient();

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

export class PromoteDemoteDto {
  @IsNotEmpty({ message: "User is required!" })
  @IsString()
  @Validate(UserLookupRule)
  username!: string;

  // These will be populated by UserLookupRule
  findUserRole?: any;
  findUserId?: string;
}
