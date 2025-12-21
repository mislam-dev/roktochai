import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import passport from "passport";
import "reflect-metadata";
import { container } from "tsyringe";
import { AuthController } from "./auth/auth.controller";
import { AuthMiddleware } from "./auth/auth.middleware";
import { registerController } from "./core/controller/register-controller";
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

  registerController(app, [AuthController, UserController]);

  // setRoutes(app);

  return app;
}
