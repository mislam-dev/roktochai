import { Prisma } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { DB_ACTIVITY_TOKEN } from "../core/database/token";

@autoInjectable()
export class ActivityService {
  constructor(
    @inject(DB_ACTIVITY_TOKEN)
    private readonly activity: Prisma.ActivityDelegate
  ) {}

  findAll() {
    return this.activity.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
