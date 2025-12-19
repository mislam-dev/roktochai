import { Prisma } from "@prisma/client";

export class ActivityService {
  constructor(private readonly activity: Prisma.ActivityDelegate) {}

  findAll() {
    return this.activity.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
