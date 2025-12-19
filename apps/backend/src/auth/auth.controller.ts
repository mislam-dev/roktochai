import { NextFunction, Request, Response } from "express";
import { AuthService, UserCreateDTO } from "./auth.service";

interface UpdatePasswordRequestBody {
  password: string;
  newPassword: string;
  confirmPassword: string;
}
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      interface RequestBodyTypes {
        username: string;
        password: string;
      }

      const { username, password }: RequestBodyTypes = req.body;

      const token = this.authService.signIn(username, password);

      return res.status(200).json({
        message: "Login was successful",
        data: { token },
      });
    } catch (error) {
      next(error);
    }
  }

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

  async forgotPassword(req: Request, res: Response, next: NextFunction) {}
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
  async me(req: Request, res: Response, next: NextFunction) {
    const user: any = req.user;

    try {
      const userData = await this.authService.findOne({ id: user.id });
      if (!userData) {
        // todo throw new error
        return res.status(404).json({
          message: "Data not found!",
          data: {},
        });
      }
      return res.status(200).json({
        message: "User found!",
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }
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
  async verifyVerificationId(req: Request, res: Response, next: NextFunction) {
    try {
      const { data: verificationId }: any = req.query;

      const data = await this.authService.findOtpRecord(verificationId);

      if (!data) {
        // todo throw new error
        return res.status(400).json({
          message: "Verification failed",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Verification successfully!",
        data: verificationId,
      });
    } catch (error) {
      next(error);
    }
  }
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
