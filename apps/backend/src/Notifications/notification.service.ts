import { Prisma } from "@prisma/client";
import { prisma } from "../core/database";

export class NotificationService {
  constructor(
    private readonly notification: Prisma.NotificationDelegate = prisma.notification
  ) {}

  async findAllForUser(userId: string) {
    return this.notification.findMany({
      where: {
        OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
        receiverId: { has: userId },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
      },
      take: 9,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notification.update({
      where: { id: notificationId },
      data: {
        readerId: {
          push: userId,
        },
      },
    });
  }

  async softDelete(id: string) {
    return this.notification.update({
      where: { id },
      data: { deleteAt: new Date() },
    });
  }

  // Utility method to be used by other services (like DonationRequestService)
  async createBroadcast(
    receiverIds: string[],
    message: string,
    creatorId: string
  ) {
    return this.notification.createMany({
      data: receiverIds.map((id) => ({
        message,
        receiverId: [id], // Adjust based on your schema (scalar vs array)
        createdById: creatorId,
      })),
    });
  }
}
