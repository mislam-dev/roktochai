import { blood_type, Prisma } from "@prisma/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { inject, injectable } from "tsyringe";
import { prisma } from "../core/database";
import { DB_DONATION_REQUESTED_TOKEN } from "../core/database/token";
import { NotFoundException } from "../core/errors";
import {
  createActivity,
  generateDonationActivityMessage,
} from "../DonationActivity/donationActivityFunction";
import { DonationActivityBuilder } from "../DonationActivity/helpers/DonationActivityBuilder";
import { CreateRequestDto } from "./dtos/create.dto";

@injectable()
export class DonationRequestService {
  constructor(
    @inject(DB_DONATION_REQUESTED_TOKEN)
    private readonly dr: Prisma.DonationRequestedDelegate,
    private readonly daBuilder: DonationActivityBuilder
  ) {}

  findAll(role: string, userId: string) {
    return this.dr.findMany({
      where: {
        OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
        ...(role !== "admin" &&
          role !== "super_admin" && {
            requestedById: userId,
          }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(data: CreateRequestDto, user: any) {
    const { firstName, lastName, address, blood } = data;

    // 1. Create the Donation Request
    const item = await this.dr.create({
      data: {
        ...data,
        status: "request",
      },
    });

    // 2. Log Activities
    await createActivity({
      type: "request",
      message: generateDonationActivityMessage.request(
        `${firstName} ${lastName}`,
        blood,
        address
      ),
      userId: user?.id,
      requestedId: item.id,
    });

    if (user) {
      await createActivity({
        type: "approve",
        message: `A request was automatically approved for ${firstName} ${lastName}`,
        userId: user.id,
        requestedId: item.id,
      });
    }

    // 3. Handle Notifications
    const admins = await prisma.user.findMany({
      where: {
        role: { OR: [{ role: "admin" }, { role: "super_admin" }] },
      },
      select: { id: true },
    });

    const authUserId = user?.id;
    const adminMessage = user
      ? `${firstName} ${lastName} request a blood of ${blood} is approved automatically!`
      : `${firstName} ${lastName} request a blood of ${blood}. Approval required!`;

    const userMessage = user
      ? `Your request is approved! We will keep you updated!`
      : `We have received your request for ${blood} blood. We will keep you updated!`;

    await prisma.notification.createMany({
      data: [
        ...admins.map((admin) => ({
          message: adminMessage,
          createdById: authUserId,
          receiverId: admin.id,
        })),
        {
          message: userMessage,
          createdById: authUserId,
          receiverId: authUserId,
        },
      ].filter((n) => n.receiverId), // Ensure we don't try to notify a null user
    });

    return item;
  }

  single(id: string) {
    return this.findUnique({ id });
  }

  async approve(id: string, user: any) {
    const item = await this.update({ id }, { status: "progress" });

    // todo use activity service
    await createActivity({
      type: "approve",
      message: generateDonationActivityMessage.approve(
        `${user.Profile.firstName} ${user.Profile.lastName} (${user.username})`,
        `${item.firstName} ${item.lastName}`
      ),
      userId: user?.id,
      requestedId: item.id,
    });

    // create notification
    // todo use notification service
    const fullname = `System Admin`; // todo generate with user profile service
    await prisma.notification.createMany({
      data: [
        {
          message: `${fullname} request (${item.id}) a blood of ${item.blood} is approved by an admin!`,
          createdById: user.id,
          receiverId: [user.id],
        },
      ],
    });
  }

  async complete(id: string, user: any) {
    const donationRequest = await this.findOne({
      id,
      status: "ready",
      AND: [{ donorId: { isSet: true } }, { donorId: { not: null } }],
    });

    if (!donationRequest || !donationRequest.donorId) {
      throw new NotFoundException();
    }

    const item = await this.update(
      {
        id,
        status: "ready",
      },
      {
        status: "completed",
        // donor: {
        //   update: {
        //     // todo use profile service to update
        //     Profile: {
        //       update: {
        //         lastDonation: new Date(),
        //       },
        //     },
        //   },
        // },
      }
    );

    // todo use activity service
    const donorFullname = `Donor fullname`;
    await createActivity({
      type: "completed",
      message: generateDonationActivityMessage.completed(
        donorFullname,
        `${item?.firstName} ${item?.lastName}`,
        item.address,
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: item.id,
    });

    // todo use notification service
    const requestFullname = `request fullname`;
    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${requestFullname} request (${item.id}) a blood of ${item.blood} is completed now!`,
          createdById: user.id,
          receiverId: item.requestedById == user.id ? [user.id] : [],
        },
        {
          message: `You have successfully given a blood. You saved a life with you blood. Respect for you!`,
          createdById: user.id,
          receiverId: [item.donorId],
        },
      ],
    });
  }

  async decline(id: string, user: any) {
    const item = await this.update({ id }, { status: "declined" });

    await createActivity({
      type: "declined",
      message: generateDonationActivityMessage.declined(
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });

    // create notification
    const requestedByName = "";
    await prisma.notification.createMany({
      data: [
        {
          message: `${requestedByName} request (${item.id}) a blood of ${item.blood} is declined by an admin!`,
          createdById: user.id,
          receiverId: item?.requestedById ? [item.requestedById] : [],
        },
      ],
    });
  }

  async progress(id: string, user: any) {
    const findRequest = await this.findOne({
      id,
    });
    // disconnect previously connected donor if exist
    if (findRequest?.donorId) {
      await prisma.user.update({
        where: { id: findRequest.donorId },
        data: {
          DonationGiven: {
            disconnect: {
              id,
              status: "ready",
            },
          },
        },
      });
    }
    const item = await this.update({ id }, { status: "progress" });

    await createActivity({
      type: "progress",
      message: generateDonationActivityMessage.progress(
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });

    // create notification
    const requestedByName = ``;
    await prisma.notification.createMany({
      data: [
        {
          message: `${requestedByName} request (${item.id}) a blood of ${item.blood} is in progress!`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
      ],
    });
  }

  async assign(id: string, donorId: string, user: any) {
    const findRequest = await prisma.donationRequested.findFirst({
      where: {
        AND: [{ id }, { OR: [{ status: "progress" }, { status: "ready" }] }],
      },
    });
    if (!findRequest) throw new NotFoundException();

    // disconnect previously connected donor if exist
    if (findRequest.donorId) {
      await prisma.user.update({
        where: { id: findRequest.donorId },
        data: {
          DonationGiven: {
            disconnect: {
              id,
              status: "ready",
            },
          },
        },
      });
    }

    const item = await this.update(
      { id },
      {
        donorId,
        status: "ready",
      }
    );

    // update user
    // todo use user service
    await prisma.user.update({
      where: {
        id: donorId,
      },
      data: {
        DonationGiven: {
          connect: {
            id,
          },
        },
      },
    });

    const donorData = await prisma.user.findUnique({
      where: {
        id: donorId,
      },
    });

    const donorFullname = "";
    await createActivity({
      type: "ready",
      message: generateDonationActivityMessage.ready(
        `${donorFullname}`,
        `${item.firstName} ${item.lastName}`,
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.username,
      requestedId: item.id,
    });

    // create notification
    const requestedFullname = ``;
    await prisma.notification.createMany({
      data: [
        {
          message: `${requestedFullname}, a donor is ready to give blood for request (${item.id}) a blood of ${item.blood}`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
        {
          message: `You are being selected to give blood for ${requestedFullname} request (${item.id})!`,
          createdById: user.id,
          receiverId: [donorId],
        },
      ],
    });
    return donorData;
  }

  async hold(id: string, user: any) {
    const findRequest = await this.findOne({ id });

    // 1. Disconnect donor if one was assigned
    if (findRequest?.donorId) {
      await prisma.user.update({
        where: { id: findRequest.donorId },
        data: {
          DonationGiven: {
            disconnect: { id, status: "ready" },
          },
        },
      });
    }

    // 2. Update status to hold and clear donor
    const item = await this.update({ id }, { status: "hold", donorId: null });

    // 3. Log Activity
    await createActivity({
      type: "hold",
      message: generateDonationActivityMessage.hold(
        `${user.Profile.firstName} ${user.Profile.lastName} (${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });

    // 4. Create Notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.firstName} ${item.lastName} request (${item.id}) a blood of ${item.blood} is in progress!`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
      ],
    });

    return item;
  }

  async softRemove(id: string, user: any) {
    // 1. Perform soft delete by setting deleteAt
    const item = await this.update({ id }, { deleteAt: new Date() });

    // 2. Log Activity
    await createActivity({
      type: "deleted",
      message: generateDonationActivityMessage.deleted(
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });

    // 3. Create Notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.firstName} ${item.lastName} request (${item.id}) a blood of ${item.blood} is in progress!`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
      ],
    });

    return item;
  }

  async findAvailableDonors(blood: blood_type, date: string) {
    const { BLOOD_DONATION_BREAK = 5 }: any = process.env;
    const fiveMonthsAgo = new Date(date);
    fiveMonthsAgo.setMonth(
      fiveMonthsAgo.getMonth() - Number(BLOOD_DONATION_BREAK)
    );

    return prisma.user.findMany({
      where: {
        isVerified: true,
        OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
        Profile: {
          bloodGroup: blood,
          OR: [
            { lastDonation: { isSet: false } },
            { lastDonation: { lte: fiveMonthsAgo } },
          ],
        },
        DonationGiven: {
          none: { status: "ready" },
        },
      },
      select: {
        id: true,
        username: true,
        Profile: {
          select: {
            bloodGroup: true,
            address: true,
            zila: true,
            upzila: true,
            displayName: true,
            firstName: true,
            lastName: true,
            phoneNo: true,
          },
        },
      },
    });
  }

  async userContributionStats(username: string) {
    const startOfCurrentMonth = startOfMonth(new Date());
    const endOfCurrentMonth = endOfMonth(new Date());

    // Use Promise.all for parallel execution of count queries
    const [totalDonations, monthDonations, totalRequests, monthRequests] =
      await Promise.all([
        prisma.donationRequested.count({
          where: { status: "completed", donor: { username } },
        }),
        prisma.donationRequested.count({
          where: {
            status: "completed",
            donor: { username },
            createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
          },
        }),
        prisma.donationRequested.count({
          where: { requestedBy: { username } },
        }),
        prisma.donationRequested.count({
          where: {
            requestedBy: { username },
            createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
          },
        }),
      ]);

    return {
      donation: {
        month: monthDonations,
        total: totalDonations,
      },
      ref: {
        month: monthRequests,
        total: totalRequests,
      },
    };
  }

  findOne(options: Prisma.DonationRequestedWhereInput) {
    return this.dr.findFirst({
      where: options,
    });
  }
  findUnique(options: Prisma.DonationRequestedWhereUniqueInput) {
    return this.dr.findFirst({
      where: options,
    });
  }

  update(
    where: Prisma.DonationRequestedWhereUniqueInput,
    data: Prisma.DonationRequestedUncheckedUpdateInput
  ) {
    return this.dr.update({
      where,
      data,
    });
  }

  remove(id: string) {
    return this.dr.delete({
      where: { id },
    });
  }
}
