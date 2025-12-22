import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { AuthMiddleware } from "../auth/auth.middleware";
import { Controller } from "../core/decorator/controller.decorator";
import { Use } from "../core/decorator/middleware.decorator";
import { DELETE, GET, PATCH } from "../core/decorator/routes.decorator";
import { NotificationService } from "./notification.service";

@autoInjectable()
@Controller("/api/v1/notification")
@Use(AuthMiddleware.authenticate)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @GET("/")
  async all(req: Request, res: Response) {
    const userId = (req.user as any).id;
    const data = await this.notificationService.findAllForUser(userId);

    return res.status(200).json({
      message: "Notifications retrieved successfully!",
      data,
    });
  }

  @PATCH("/")
  async read(req: Request, res: Response) {
    const userId = (req.user as any).id; // Changed from req.User.id for consistency
    const data = await this.notificationService.markAsRead(req.body.id, userId);

    return res.status(200).json({
      message: "Notification marked as read!",
      data,
    });
  }

  @DELETE("/:id")
  async remove(req: Request<{ id: string }>, res: Response) {
    await this.notificationService.softDelete(req.params.id);

    return res.status(200).json({
      message: "Notification deleted successfully!",
      data: null,
    });
  }
}
