import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { AuthMiddleware } from "../auth/auth.middleware";
import { Controller } from "../core/decorator/controller.decorator";
import { Use } from "../core/decorator/middleware.decorator";
import { GET } from "../core/decorator/routes.decorator";
import { ActivityService } from "./activity.service";

@autoInjectable()
@Controller("/api/v1/activity")
@Use(AuthMiddleware.authenticate)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @GET("/")
  async all(req: Request, res: Response) {
    const data = await this.activityService.findAll();
    return res.status(200).json({
      message: "Request was successful!",
      data: data,
    });
  }
}
