import { blood_type } from "@prisma/client";
import { IsDateString, IsNotEmpty } from "class-validator";
export class FinderDonorDto {
  @IsNotEmpty({ message: "Blood group is required!" })
  blood!: blood_type;

  @IsNotEmpty({ message: "Date is required!" })
  @IsDateString({}, { message: "Date must be a valid ISO string!" })
  date!: string;
}
