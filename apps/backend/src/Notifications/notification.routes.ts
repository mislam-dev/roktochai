import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { NotificationController } from "./notification.controller";

const { all } = new NotificationController();

const notificationRouter: Router = express.Router();
notificationRouter.get("/", authenticate, all);

export default notificationRouter;
