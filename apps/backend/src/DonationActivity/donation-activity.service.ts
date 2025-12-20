import { Prisma } from "@prisma/client";
import { prisma } from "../core/database";

export class DonationActivityService {
  constructor(
    private readonly da: Prisma.DonationActivityDelegate = prisma.donationActivity
  ) {}

  create(data: Prisma.DonationActivityCreateInput) {
    return this.da.create({
      data,
    });
  }

  findAll(userId: string, role: string) {
    return this.da.findMany({
      where: {
        ...(role !== "admin" &&
          role !== "super_admin" && {
            request: {
              requestedBy: {
                id: userId,
              },
            },
          }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        message: true,
        type: true,
        id: true,
      },
    });
  }

  findOne(options: Prisma.DonationActivityWhereInput) {
    return this.da.findFirst({ where: options });
  }
  findUnique(options: Prisma.DonationActivityWhereUniqueInput) {
    return this.da.findFirst({ where: options });
  }

  update(
    options: Prisma.DonationActivityWhereUniqueInput,
    data: Prisma.DonationActivityUpdateInput
  ) {
    return this.da.update({
      where: options,
      data,
    });
  }
}
