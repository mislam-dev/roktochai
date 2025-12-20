import express, { Router } from "express";
import { AuthMiddleware } from "../auth/auth.middleware";
import { validateDto } from "../core/validator/class-schema.validator";
import { DonationRequestController } from "./donation-request.controller";
import { AssignDonorDto } from "./dtos/asign-donor.dto";
import { CreateRequestDto } from "./dtos/create.dto";
import { FinderDonorDto } from "./dtos/find-donor.dto";

const { authenticate, isAdmin, isSuperAdmin } = new AuthMiddleware();
const {
  all,
  approve,
  assign,
  complete,
  create,
  decline,
  findDonor,
  hold,
  progress,
  remove,
  single,
  userContribution,
} = new DonationRequestController();

// base router url => /api/v1/donation/requested
const donationRequestRouter: Router = express.Router();

donationRequestRouter.use(authenticate);

donationRequestRouter.get("/", all);
donationRequestRouter.post("/", validateDto(CreateRequestDto), create);
donationRequestRouter.get("/:id", single);
donationRequestRouter.put("/approve/:id", isAdmin, approve);
donationRequestRouter.put("/complete/:id", isAdmin, complete);
donationRequestRouter.put("/decline/:id", isAdmin, decline);
donationRequestRouter.put("/progress/:id", isAdmin, progress);

donationRequestRouter.put("/hold/:id", isAdmin, hold);
donationRequestRouter.put(
  "/assign/:id",
  isAdmin,
  validateDto(AssignDonorDto),
  assign
);
donationRequestRouter.delete("/:id", isSuperAdmin, remove);
donationRequestRouter.post(
  "/find-donor",
  isAdmin,
  validateDto(FinderDonorDto),
  findDonor
);
donationRequestRouter.get("/contribution/:username", isAdmin, userContribution);

export default donationRequestRouter;
