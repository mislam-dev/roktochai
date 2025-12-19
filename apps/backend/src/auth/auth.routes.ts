import express, { Router } from "express";
import { errorResponse } from "../helpers/errorResponses";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { authenticate } from "./authMiddleware";
import {
  recoverAccountValidator,
  setNewPasswordValidator,
  signInValidator,
  signUpValidator,
  updateInfoValidator,
  updatePasswordValidator,
  updateProfileValidator,
  verifyOtpValidator,
} from "./authValidator";

const {
  forgotPassword,
  me,
  recoverAccount,
  setNewPassword,
  signIn,
  signUp,
  updateInfo,
  updatePassword,
  updateProfile,
  verifyOtp,
  verifyVerificationId,
} = new AuthController(new AuthService());

const authRouter: Router = express.Router();
authRouter.post("/sign-in", signInValidator, errorResponse, signIn);
authRouter.post("/sign-up", signUpValidator, errorResponse, signUp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post(
  "/recover-password",
  recoverAccountValidator,
  errorResponse,
  recoverAccount
);
authRouter.put(
  "/update-password",
  authenticate,
  updatePasswordValidator,
  errorResponse,
  updatePassword
);
authRouter.put(
  "/update-info",
  authenticate,
  updateInfoValidator,
  errorResponse,
  updateInfo
);
authRouter.post("/me", authenticate, me);
authRouter.put(
  "/update-profile",
  authenticate,
  updateProfileValidator,
  errorResponse,
  updateProfile
);
authRouter.post("/verify-otp", verifyOtpValidator, errorResponse, verifyOtp);
authRouter.get("/verify-verification-id", verifyVerificationId);
authRouter.put(
  "/set-password",
  setNewPasswordValidator,
  errorResponse,
  setNewPassword
);

export default authRouter;
