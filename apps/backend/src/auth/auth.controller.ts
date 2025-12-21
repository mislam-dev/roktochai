import { NextFunction, Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { Controller } from "../core/decorator/controller.decorator";
import { Use } from "../core/decorator/middleware.decorator";
import { GET, POST, PUT } from "../core/decorator/routes.decorator";
import { HttpException, NotFoundException } from "../core/errors";
import { AuthMiddleware } from "./auth.middleware";
import { AuthService, UserCreateDTO } from "./auth.service";
import { SignInDto } from "./dtos/sign-in.dto";

interface UpdatePasswordRequestBody {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

@autoInjectable()
@Controller("/api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @POST("/sign-in")
  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password }: SignInDto = req.body;

      const token = this.authService.signIn(username, password);

      return res.status(200).json({
        message: "Login was successful",
        data: { token },
      });
    } catch (error) {
      next(error);
    }
  }

  @POST("/sign-up")
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.authService.create_user(
        req.body as UserCreateDTO
      );

      return res.status(200).json({
        isSuccess: true,
        message: "Registration Successful",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  @POST("/forgot-password")
  async forgotPassword(req: Request, res: Response, next: NextFunction) {}

  @POST("/recover-password")
  async recoverAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const user: any = req.user;

      await this.authService.generateOtp(user.email, user.idß);

      return res
        .status(200)
        .json({ message: "We have send you an OTP to your email" });
    } catch (error) {
      next(error);
    }
  }

  @Use(AuthMiddleware.authenticate)
  @PUT("/update-password")
  async updatePassword(
    req: Request<{}, {}, UpdatePasswordRequestBody>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { password, newPassword } = req.body;
      const user: any = req.user; // Assuming user info is stored in req.user

      await this.authService.updatePassword(password, newPassword, user.id);

      return res.status(200).json({
        message: "Password updated successfully!",
      });
    } catch (error) {
      next(error);
    }
  }

  @POST("/me")
  @Use(AuthMiddleware.authenticate)
  async me(req: Request, res: Response, next: NextFunction) {
    const user: any = req.user;

    try {
      const userData = await this.authService.findOne({ id: user.id });
      if (!userData) throw new NotFoundException();
      return res.status(200).json({
        message: "User found!",
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }

  @PUT("/update-info")
  @Use(AuthMiddleware.authenticate)
  async updateInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const user: any = req.user;
      const { email }: { email?: string } = req.body;

      await this.authService.update(user.id, { email });

      return res.status(200).json({
        message: "Profile updated successfully!",
      });
    } catch (error) {
      next(error);
    }
  }
  @PUT("/update-profile")
  @Use(AuthMiddleware.authenticate)
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user: any = req.user;

      const updateData: any = {};
      Object.assign(updateData, req.body);

      const updatedProfile = await this.authService.updateProfile(
        user.id,
        updateData
      );

      return res.status(200).json({
        message: "Profile updated successfully!",
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
  @POST("/verify-otp")
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { otpRecordId }: any = req.body;
      // Generate a random string with 20 characters
      const hash = await this.authService.verifyOtp(otpRecordId);

      return res.status(200).json({
        message: "OTP verified successfully!",
        data: hash,
      });
    } catch (error) {
      next(error);
    }
  }
  @GET("/verify-verification-id")
  async verifyVerificationId(req: Request, res: Response, next: NextFunction) {
    try {
      const { data: verificationId }: any = req.query;

      const data = await this.authService.findOtpRecord(verificationId);

      if (!data) throw new HttpException("Verification failed", 400);

      return res.status(200).json({
        message: "Verification successfully!",
        data: verificationId,
      });
    } catch (error) {
      next(error);
    }
  }
  @PUT("/set-password")
  async setNewPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword, verificationId } = req.body;

      if (!verificationId) {
        return res.status(406).json({
          message: "Verification ID is required",
          data: null,
        });
      }

      await this.authService.setNewPassword(verificationId, newPassword);

      return res.status(200).json({
        message: "Password updated successfully!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
