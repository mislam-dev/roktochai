import express, { Router } from "express";
import { container } from "tsyringe";
import { validateDto } from "../core/validator/class-schema.validator";
import { AuthController } from "./auth.controller";
import { RecoverAccountDto } from "./dtos/recover-account.dto";
import { SignInDto } from "./dtos/sign-in.dto";
import { SignUpDto } from "./dtos/sign-up.dto";
import { UpdateInfoDto } from "./dtos/update-info.dto";
import { UpdatePasswordDto } from "./dtos/update-password.dto";
import { UpdateProfileDto } from "./dtos/update-profile.dto";
import { VerifyOtpDto } from "./dtos/verify-otp.dto";

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
} = container.resolve(AuthController);

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
  validateDto(UpdatePasswordDto),
  updatePassword
);
authRouter.put("/update-info", validateDto(UpdateInfoDto), updateInfo);
authRouter.post("/me", me);
authRouter.put("/update-profile", validateDto(UpdateProfileDto), updateProfile);
authRouter.post("/verify-otp", validateDto(VerifyOtpDto), verifyOtp);
authRouter.get("/verify-verification-id", verifyVerificationId);
authRouter.put("/set-password", validateDto(UpdatePasswordDto), setNewPassword);

export default authRouter;
