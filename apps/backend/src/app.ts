import cors from "cors";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import passport from "passport";
import "reflect-metadata";
import { container } from "tsyringe";
import { ActivityController } from "./activity/activity.controller";
import { AuthController } from "./auth/auth.controller";
import { AuthMiddleware } from "./auth/auth.middleware";
import { registerController } from "./core/controller/register-controller";
import { HttpException, ValidationException } from "./core/errors";
import { DonationActivityController } from "./DonationActivity/donation-activity.controller";
import { DonationRequestController } from "./DonationRequest/donation-request.controller";
import { FeaturedController } from "./featured/featured.controller";
import { NotificationController } from "./Notifications/notification.controller";
import { UserController } from "./user/user.controller";

export function createApp() {
  const app: Express = express();

  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  app.use(morgan("dev"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const authMiddleware = container.resolve(AuthMiddleware);

  authMiddleware.init(passport);

  app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
      message: "You are good to go",
    });
  });

  app.get("/health", (req: Request, res: Response) => {
    try {
      res.status(200).json({ message: "UP" });
      return;
    } catch (e) {
      res.status(500).json({ message: "DOWN" });
      return;
    }
  });

  registerController(app, [
    AuthController,
    UserController,
    FeaturedController,
    ActivityController,
    DonationRequestController,
    DonationActivityController,
    NotificationController,
  ]);

  // 404 not found handler
  app.use((_req, res: Response) => {
    res.status(404).json({ message: "You requested resource not found!" });
  });

  // 500 internal server error handler
  app.use((err: any, _req: any, res: Response, _next: any) => {
    if (err instanceof ValidationException) {
      return res.status(err.statusCode).json({
        message: err.message,
        errors: err.all,
      });
    }
    if (err instanceof HttpException) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
    return;
  });

  return app;
}
