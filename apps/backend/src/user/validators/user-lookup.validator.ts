import { PrismaClient } from "@prisma/client";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

const prisma = new PrismaClient();

@ValidatorConstraint({ name: "UserLookup", async: true })
export class UserLookupConstraints implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
      select: { role: true, id: true },
    });

    if (!user) return false;

    // Attach data to the instance for use in the controller
    const obj = args.object as any;
    obj.findUserRole = user.role.name;
    obj.findUserId = user.id;
    return true;
  }
  defaultMessage() {
    return "User doesn't exist!";
  }
}
