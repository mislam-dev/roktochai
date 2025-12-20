import { Express, Request, Response } from "express";
import donationActivityRouter from "../DonationActivity/donation-activity.routes";
import donationRequestRouter from "../DonationRequest/donation-request.routes";
import notificationRouter from "../Notifications/notification.routes";
import activityRouter from "../activity/activity.routes";
import authRouter from "../auth/auth.routes";
import featuredRouter from "../featured/featured.routes";
import userRouter from "../user/user.routes";

const routeArrays = [
  {
    path: "/api/v1/auth",
    handler: authRouter,
  },
  {
    path: "/api/v1/user",
    handler: userRouter,
  },
  {
    path: "/api/v1/featured",
    handler: featuredRouter,
  },
  {
    path: "/api/v1/activity",
    handler: activityRouter,
  },
  {
    path: "/api/v1/donation/requested",
    handler: donationRequestRouter,
  },
  {
    path: "/api/v1/donation/activity",
    handler: donationActivityRouter,
  },
  {
    path: "/api/v1/notification",
    handler: notificationRouter,
  },
  {
    path: "/",
    handler: (req: Request, res: Response) => {
      return res.status(200).json({
        message: "You are good to go",
      });
    },
  },
];

const setRoutes = (app: Express) => {
  routeArrays.forEach((route) => {
    if (route.path === "/") {
      app.get(route.path, route.handler);
    } else {
      app.use(route.path, route.handler);
    }
  });
};

export default setRoutes;
