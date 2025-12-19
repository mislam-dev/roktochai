import { NextFunction, Request, Response } from "express";
import { ActivityService } from "./activity.service";

export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.activityService.findAll();
      return res.status(200).json({
        message: "Request was successful!",
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
}
