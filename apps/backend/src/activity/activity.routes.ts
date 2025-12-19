import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { prisma } from "../core/database";
import { ActivityController } from "./activity.controller";
import { ActivityService } from "./activity.service";

const activityController = new ActivityController(
  new ActivityService(prisma.activity)
);

const activityRouter: Router = express.Router();
activityRouter.get("/", authenticate, activityController.all);

export default activityRouter;
