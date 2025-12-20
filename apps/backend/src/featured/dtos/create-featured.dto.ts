import { PrismaClient } from "@prisma/client";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isAfter, isBefore } from "date-fns";

const prisma = new PrismaClient();

// 1. Check if username exists and attach ID
@ValidatorConstraint({ name: "UserExists", async: true })
export class UserExistsRule implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    const findUser = await prisma.user.findFirst({ where: { username } });
    if (!findUser) return false;

    // Attaching the ID to the object (DTO instance)
    (args.object as any).userId = findUser.id;
    return true;
  }
  defaultMessage() {
    return "Invalid username!";
  }
}

// 2. Check if end date is after start date
@ValidatorConstraint({ name: "IsAfterField", async: false })
export class IsAfterFieldRule implements ValidatorConstraintInterface {
  validate(endDateValue: any, args: ValidationArguments) {
    const { start } = args.object as any;
    if (!endDateValue || !start) return true;
    return isAfter(new Date(endDateValue), new Date(start));
  }
  defaultMessage() {
    return "End date must be bigger date than start date!";
  }
}
/**
 * Base class to handle shared date logic
 * used in both Create and Update
 */
export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  @Validate((value: string) => !isBefore(new Date(value), new Date()), {
    message: "Start date must be a future date!",
  })
  start?: string;

  @IsOptional()
  @IsDateString()
  @Validate(IsAfterFieldRule)
  end?: string;
}

/**
 * DTO for Creating (Requires Username)
 */
export class CreateRequestDto extends DateRangeDto {
  @IsNotEmpty({ message: "username is required!" })
  @Validate(UserExistsRule)
  username!: string;

  // This will be populated by the UserExistsRule
  userId?: string;
}
