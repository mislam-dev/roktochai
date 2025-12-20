import { NextFunction, Request, Response } from "express";
import { DonationActivityService } from "./donation-activity.service";

export class DonationActivityController {
  constructor(
    private readonly daService: DonationActivityService = new DonationActivityService()
  ) {}

  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.user as any)?.role?.role;

      const data = await this.daService.findAll((req.user as any).id, role);

      return res.status(200).json({
        message: "Request was successful!",
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  single = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const single = await this.daService.findUnique({
        id: req.params.id,
      });

      return res.status(200).json({
        message: "Request was successful!",
        data: single,
      });
    } catch (error) {
      next(error);
    }
  };

  async remove(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await this.daService.update(
        { id: req.params.id },
        { deleteAt: new Date() }
      );

      return res.status(204).json({
        message: "History deleted successfully!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
