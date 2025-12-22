import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { prisma } from "../../core/database";

@ValidatorConstraint({ name: "IsEmailUnique", async: true })
export class IsEmailUniqueConstraints implements ValidatorConstraintInterface {
  async validate(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    return !user;
  }
  defaultMessage() {
    return "Email already exists!";
  }
}
