import { Prisma } from "@prisma/client";
import { autoInjectable, inject } from "tsyringe";
import { PasswordHash } from "../auth/helpers/password-hash.helper";
import { prisma } from "../core/database";
import { DB_USER_TOKEN } from "../core/database/token";
import { ProfileService } from "../profile/profile.service";
import { RoleName, RoleService } from "../role/role.service";
// todo introduce new class for helpers
import { InternalServerException } from "../core/errors";
import { CreateUserDto } from "./dtos/create-user.dto";
import { randomPassword } from "./user.helpers";

@autoInjectable()
export class UserService {
  constructor(
    @inject(DB_USER_TOKEN) private readonly user: Prisma.UserDelegate,
    private readonly hash: PasswordHash,
    private readonly roleService: RoleService,
    private readonly profileService: ProfileService
  ) {}
  async findAll() {
    return this.user.findMany({
      where: { OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }] },
    });
  }

  async createUser(data: CreateUserDto) {
    const { firstName, lastName, email, phoneNo, blood } = data;

    let username = await this.generateUniqueUsername(firstName, lastName);

    const password = randomPassword(12);
    const hash = this.hash.hash(password);

    const role = await this.roleService.findOne({ role: "user" });
    console.error("Role is not found on the tables");
    if (!role) throw new InternalServerException();

    const newUser = await this.user.create({
      data: {
        email,
        username,
        password: hash,
        isVerified: true,
        roleId: role.id,
      },
    });

    await this.profileService.create({
      firstName,
      lastName,
      bloodGroup: blood,
      phoneNo,
      userId: newUser.id,
    });
    // todo Background Tasks introduce mail service (Mails)
    // sendMailToNewUser(email, password, `${firstName} ${lastName}`);
    // const admins = await this.user.findMany({
    //   where: { role: { role: "super_admin" } },
    //   select: { email: true },
    // });
    // sendMailToAdminsForNewUser(admins.map((a) => a.email));

    return newUser;
  }

  async promoteUser(
    findUserId: string,
    currentRole: RoleName,
    authUserId: string
  ) {
    const targetRole = await this.roleService.nextRole(currentRole);

    const updatedUser = await this.user.update({
      where: { id: findUserId },
      data: { roleId: targetRole?.id },
    });

    // todo use notification service
    await prisma.notification.create({
      data: {
        message: `You have been promoted to ${targetRole?.name}!`,
        createdById: authUserId,
        receiverId: [findUserId],
      },
    });

    return updatedUser;
  }

  async findByUsernameOrEmail(identifier: string) {
    return this.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
  }

  async demoteUser(findUserId: string, currentRole: any, authUserId: string) {
    const targetRole = await this.roleService.prevRole(currentRole.role); // Logic for role sequence

    const updatedUser = await this.user.update({
      where: { id: findUserId },
      data: { roleId: targetRole?.id },
    });

    // todo use notification service
    await prisma.notification.create({
      data: {
        message: `You have been demoted! Now you are ${targetRole?.name}`,
        createdById: authUserId,
        receiverId: [findUserId],
      },
    });

    return updatedUser;
  }

  async verifyUser(username: string) {
    const userData = await this.user.update({
      where: { username },
      data: { isVerified: true },
    });

    // todo Trigger verification email
    // sendMailToVerifiedUser(userData.email);
    return userData;
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
  async updateUserInfo(id: string, data: Prisma.UserUpdateInput) {
    return this.user.update({
      where: { id },
      data,
    });
  }

  private generateUsername(name: string) {
    // Generate a random number between 1000 and 9999
    const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    // Concatenate the name and random number
    const username = `${name}${randomNumber}`;

    return username.replace(" ", "_");
  }

  private async generateUniqueUsername(firstName: string, lastName: string) {
    let username = this.generateUsername(`${firstName} ${lastName}`);
    while (await this.user.findFirst({ where: { username } })) {
      username = this.generateUsername(
        firstName + Math.floor(Math.random() * 1000)
      );
    }
    return username;
  }

  async findOne(options: Prisma.UserWhereInput) {
    return this.user.findFirst({ where: options });
  }
  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput
  ) {
    this.user.update({
      where,
      data,
    });
  }
}
