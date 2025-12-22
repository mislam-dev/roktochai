import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { autoInjectable, inject } from "tsyringe";
import { prisma } from "../core/database";
import { DB_USER_TOKEN } from "../core/database/token";

import {
  sendMailToAdminsForNewUser,
  sendMailToNewUser,
  sendMailToVerifiedUser,
} from "./Mail";
import { nextRoleName, prevRoleName, randomPassword } from "./user.helpers";

@autoInjectable()
export class UserService {
  constructor(
    @inject(DB_USER_TOKEN) private readonly user: Prisma.UserDelegate
  ) {}
  async findAll() {
    return this.user.findMany({
      where: { OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }] },
    });
  }

  async createUser(data: any) {
    const { firstName, lastName, email, phoneNo, blood } = data;

    // 1. Generate Unique Username
    let username = this.generateUsername(`${firstName} ${lastName}`);
    while (await this.user.findFirst({ where: { username } })) {
      username = this.generateUsername(
        firstName + Math.floor(Math.random() * 1000)
      );
    }

    // 2. Hash Password
    const password = randomPassword(12);
    const SALT = process.env.SALT_ROUND ? parseInt(process.env.SALT_ROUND) : 10;
    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(SALT));

    // 3. Create User
    const newUser = await this.user.create({
      data: {
        email,
        username,
        password: hash,
        isVerified: true,
        roleId: "user",
        Profile: {
          create: { firstName, lastName, bloodGroup: blood, phoneNo },
        },
      },
    });

    // 4. Background Tasks (Mails)
    sendMailToNewUser(email, password, `${firstName} ${lastName}`);
    const admins = await this.user.findMany({
      where: { role: { role: "super_admin" } },
      select: { email: true },
    });
    sendMailToAdminsForNewUser(admins.map((a) => a.email));

    return newUser;
  }

  async promoteUser(findUserId: string, currentRole: any, authUserId: string) {
    const roleText = nextRoleName(currentRole.role);
    const targetRole = await prisma.role.findFirst({
      where: { role: roleText },
    });

    const updatedUser = await this.user.update({
      where: { id: findUserId },
      data: { roleId: targetRole?.id },
    });

    await prisma.notification.create({
      data: {
        message: `You have been promoted to ${targetRole?.name}!`,
        createdById: authUserId,
        receiverId: [findUserId],
      },
    });

    return updatedUser;
  }

  async updateProfile(userId: string, updateData: any) {
    return this.user.update({
      where: { id: userId },
      data: { Profile: { update: updateData } },
    });
  }

  async findByUsernameOrEmail(identifier: string) {
    return this.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
  }

  async getRoles() {
    return prisma.role.findMany({
      select: { id: true, name: true, role: true },
    });
  }

  async verifyUser(username: string) {
    const userData = await this.user.update({
      where: { username },
      data: { isVerified: true },
      include: { Profile: true },
    });

    // Trigger verification email
    sendMailToVerifiedUser(userData.email);
    return userData;
  }

  async demoteUser(findUserId: string, currentRole: any, authUserId: string) {
    const roleText = prevRoleName(currentRole.role); // Logic for role sequence
    const targetRole = await prisma.role.findFirst({
      where: { role: roleText },
    });

    const updatedUser = await this.user.update({
      where: { id: findUserId },
      data: { roleId: targetRole?.id },
    });

    await prisma.notification.create({
      data: {
        message: `You have been demoted! Now you are ${targetRole?.name}`,
        createdById: authUserId,
        receiverId: [findUserId],
      },
    });

    return updatedUser;
  }

  async requestDeletion(username: string) {
    return this.user.updateMany({
      where: {
        OR: [{ username }, { email: username }],
      },
      data: { isDelete: true }, // Mark for deletion request
    });
  }

  async confirmDeletion(username: string) {
    return this.user.updateMany({
      where: {
        OR: [{ username }, { email: username }],
      },
      data: { deleteAt: new Date() }, // Permanent soft-delete
    });
  }

  // Placeholder for future update logic
  async updateUserInfo(id: string, data: any) {
    return this.user.update({
      where: { id },
      data,
    });
  }

  generateUsername(name: string) {
    // Generate a random number between 1000 and 9999
    const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    // Concatenate the name and random number
    const username = `${name}${randomNumber}`;

    return username.replace(" ", "_");
  }
}
