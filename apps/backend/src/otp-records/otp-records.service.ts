import { Prisma } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { DB_OTP_RECORDS_TOKEN } from "../core/database/token";

@autoInjectable()
export class OtpRecordsService {
  constructor(
    @inject(DB_OTP_RECORDS_TOKEN)
    private readonly otpRecords: Prisma.OtpRecordsDelegate
  ) {}

  findAll() {
    return this.otpRecords.findMany();
  }

  findOne(options: Prisma.OtpRecordsWhereInput) {
    return this.otpRecords.findFirst({ where: options });
  }

  create(data: Prisma.OtpRecordsUncheckedCreateInput) {
    return this.otpRecords.create({ data });
  }

  update(
    where: Prisma.OtpRecordsWhereUniqueInput,
    data: Prisma.OtpRecordsUpdateInput
  ) {
    return this.otpRecords.update({
      where,
      data,
    });
  }

  remove(id: string) {
    return this.otpRecords.delete({ where: { id } });
  }
}
