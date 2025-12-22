import { Prisma } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { DB_PROFILE_TOKEN } from "../core/database/token";

@autoInjectable()
export class ProfileService {
  constructor(
    @inject(DB_PROFILE_TOKEN) private readonly profile: Prisma.ProfileDelegate
  ) {}

  async updateProfileWitUserId(
    userId: string,
    data: Prisma.ProfileUpdateInput
  ) {
    return this.profile.update({
      where: { userId },
      data,
    });
  }
  async updateProfile(id: string, data: Prisma.ProfileUpdateInput) {
    return this.profile.update({
      where: { id },
      data,
    });
  }

  async create(data: Prisma.ProfileUncheckedCreateInput) {
    return this.profile.create({ data });
  }
}
