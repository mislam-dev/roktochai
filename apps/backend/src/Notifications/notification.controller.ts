import { NextFunction, Request, Response } from "express";
import { NotificationService } from "./notification.service";

export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService = new NotificationService()
  ) {}

  all = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const data = await this.notificationService.findAllForUser(userId);

      return res.status(200).json({
        message: "Notifications retrieved successfully!",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  read = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id; // Changed from req.User.id for consistency
      const data = await this.notificationService.markAsRead(
        req.body.id,
        userId
      );

      return res.status(200).json({
        message: "Notification marked as read!",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  remove = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.notificationService.softDelete(req.params.id);

      return res.status(200).json({
        message: "Notification deleted successfully!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
