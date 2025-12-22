import { Prisma } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { DB_ROLE_TOKEN } from "../core/database/token";

export type RoleName = "user" | "admin" | "super_admin";

@autoInjectable()
export class RoleService {
  constructor(
    @inject(DB_ROLE_TOKEN) private readonly role: Prisma.RoleDelegate
  ) {}

  async getRoles() {
    return this.role.findMany({
      select: { id: true, name: true, role: true },
    });
  }

  async findOne(options: Prisma.RoleWhereUniqueInput) {
    return this.role.findFirst({
      where: options,
    });
  }

  nextRole(name: RoleName) {
    const nextRoleObject = {
      user: "admin",
      admin: "super_admin",
      super_admin: "super_admin",
    };

    const role = nextRoleObject[name];

    return this.findOne({ role: role });
  }

  prevRole(name: RoleName) {
    const prevRoleObject = {
      super_admin: "admin",
      admin: "user",
      user: "user",
    };

    const role = prevRoleObject[name];

    return this.findOne({ role });
  }
}
