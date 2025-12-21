import { Express, Request, Response } from "express";
import donationActivityRouter from "../DonationActivity/donation-activity.routes";
import notificationRouter from "../Notifications/notification.routes";
import authRouter from "../auth/auth.routes";

const routeArrays = [
  {
    path: "/api/v1/auth",
    handler: authRouter,
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
