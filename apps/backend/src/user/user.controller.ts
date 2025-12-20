import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  constructor(private readonly userService: UserService = new UserService()) {}

  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.userService.findAll();
      res
        .status(200)
        .json({ message: "Request successful", data, len: data.length });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.userService.createUser(req.body);
      res
        .status(201)
        .json({ isSuccess: true, message: "User created Successfully!", data });
    } catch (error) {
      next(error);
    }
  }

  async single(
    req: Request<{ username: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await this.userService.findByUsernameOrEmail(
        req.params.username
      );
      res.status(200).json({ isSuccess: true, message: "User found!", data });
    } catch (error) {
      next(error);
    }
  }

  async promote(req: Request, res: Response, next: NextFunction) {
    try {
      const { findUserId, findUserRole } = req.body;
      const authUserId = (req.user as any).id;
      await this.userService.promoteUser(findUserId, findUserRole, authUserId);
      res
        .status(200)
        .json({ isSuccess: true, message: "User promoted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).id;
      await this.userService.updateProfile(userId, req.body);
      res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
      next(error);
    }
  }

  getRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.userService.getRoles();
      res.status(200).json({ message: "Roles retrieved successfully", data });
    } catch (error) {
      next(error);
    }
  };

  verify = async (
    req: Request<{ username: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.userService.verifyUser(req.params.username);
      res
        .status(200)
        .json({
          isSuccess: true,
          message: "User verified Successfully!",
          data,
        });
    } catch (error) {
      next(error);
    }
  };

  demote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { findUserId, findUserRole } = req.body;
      const authUserId = (req.user as any).id;
      await this.userService.demoteUser(findUserId, findUserRole, authUserId);
      res
        .status(200)
        .json({ isSuccess: true, message: "User demoted successfully" });
    } catch (error) {
      next(error);
    }
  };

  remove = async (
    req: Request<{ username: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.requestDeletion(req.params.username);
      res
        .status(204)
        .json({ isSuccess: true, message: "User delete request sent!" });
    } catch (error) {
      next(error);
    }
  };

  removeConfirm = async (
    req: Request<{ username: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.confirmDeletion(req.params.username);
      res
        .status(204)
        .json({ isSuccess: true, message: "User deleted successfully!" });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.userService.updateUserInfo(
        req.params.id,
        req.body
      );
      res.status(200).json({ message: "User updated successfully", data });
    } catch (error) {
      next(error);
    }
  };
}
