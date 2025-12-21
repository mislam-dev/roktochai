import { PrismaClient } from "@prisma/client";
import { container } from "tsyringe";
import { prisma } from "./core/database";
import {
  DBClientToken,
  DB_ACTIVITY_TOKEN,
  DB_DONATION_ACTIVITY_TOKEN,
  DB_DONATION_REQUESTED_TOKEN,
  DB_FEATURED_TOKEN,
  DB_NOTIFICATIONS_TOKEN,
  DB_OTP_RECORDS_TOKEN,
  DB_PROFILE_TOKEN,
  DB_RESET_PASSWORD_TOKEN,
  DB_ROLE_TOKEN,
  DB_USER_TOKEN,
} from "./core/database/token";

export function resolveDependencies() {
  const dbClient = new PrismaClient();

  container.register(DBClientToken, {
    useValue: dbClient,
  });

  container.register(DB_DONATION_REQUESTED_TOKEN, {
    useValue: prisma.donationRequested,
  });
  container.register(DB_DONATION_ACTIVITY_TOKEN, {
    useValue: prisma.donationActivity,
  });
  container.register(DB_USER_TOKEN, {
    useValue: prisma.user,
  });
  container.register(DB_ACTIVITY_TOKEN, {
    useValue: prisma.activity,
  });
  container.register(DB_FEATURED_TOKEN, {
    useValue: prisma.featured,
  });
  container.register(DB_NOTIFICATIONS_TOKEN, {
    useValue: prisma.notification,
  });
  container.register(DB_OTP_RECORDS_TOKEN, {
    useValue: prisma.otpRecords,
  });
  container.register(DB_PROFILE_TOKEN, {
    useValue: prisma.profile,
  });
  container.register(DB_RESET_PASSWORD_TOKEN, {
    useValue: prisma.resetPassword,
  });
  container.register(DB_ROLE_TOKEN, {
    useValue: prisma.role,
  });
}
