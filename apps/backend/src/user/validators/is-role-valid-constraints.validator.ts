import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { prisma } from "../../core/database";

@ValidatorConstraint({ name: "IsRoleValid", async: true })
export class IsRoleValidConstraints implements ValidatorConstraintInterface {
  async validate(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    return !!role;
  }
  defaultMessage() {
    return "Invalid role!";
  }
}
