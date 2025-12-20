import express, { Router } from "express";
import { validateDto } from "../core/validator/class-schema.validator";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { RecoverAccountDto } from "./dtos/recover-account.dto";
import { SignInDto } from "./dtos/sign-in.dto";
import { SignUpDto } from "./dtos/sign-up.dto";
import { UpdateInfoDto } from "./dtos/update-info.dto";
import { UpdatePasswordDto } from "./dtos/update-password.dto";
import { UpdateProfileDto } from "./dtos/update-profile.dto";
import { VerifyOtpDto } from "./dtos/verify-otp.dto";

const { authenticate } = new AuthMiddleware();

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
authRouter.post("/sign-in", validateDto(SignInDto), signIn);
authRouter.post("/sign-up", validateDto(SignUpDto), signUp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post(
  "/recover-password",
  validateDto(RecoverAccountDto),
  recoverAccount
);
authRouter.put(
  "/update-password",
  authenticate,
  validateDto(UpdatePasswordDto),
  updatePassword
);
authRouter.put(
  "/update-info",
  authenticate,
  validateDto(UpdateInfoDto),
  updateInfo
);
authRouter.post("/me", authenticate, me);
authRouter.put(
  "/update-profile",
  authenticate,
  validateDto(UpdateProfileDto),
  updateProfile
);
authRouter.post("/verify-otp", validateDto(VerifyOtpDto), verifyOtp);
authRouter.get("/verify-verification-id", verifyVerificationId);
authRouter.put("/set-password", validateDto(UpdatePasswordDto), setNewPassword);

export default authRouter;
