import express, { Router } from "express";
import { AuthMiddleware } from "../auth/auth.middleware";
import { DonationActivityController } from "./donation-activity.controller";

const { all, single, remove } = new DonationActivityController();
const { authenticate } = new AuthMiddleware();

const donationActivityRouter: Router = express.Router();
donationActivityRouter.get("/", authenticate, all);
donationActivityRouter.get("/:id", authenticate, single);
donationActivityRouter.delete("/:id", authenticate, remove);

export default donationActivityRouter;
