import {
  IsNotEmpty,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { prisma } from "../../core/database";

@ValidatorConstraint({ name: "IsDonorValid", async: true })
export class IsDonorValidRule implements ValidatorConstraintInterface {
  async validate(id: string) {
    const findUser = await prisma.user.findFirst({ where: { id } });
    return !!findUser;
  }
  defaultMessage() {
    return "Invalid donor!";
  }
}

export class AssignDonorDto {
  @IsNotEmpty({ message: "Donor is required!" })
  @Validate(IsDonorValidRule)
  donorId!: string;
}
