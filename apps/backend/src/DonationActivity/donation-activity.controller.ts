import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { AuthMiddleware } from "../auth/auth.middleware";
import { Controller } from "../core/decorator/controller.decorator";
import { Use } from "../core/decorator/middleware.decorator";
import { DELETE, GET } from "../core/decorator/routes.decorator";
import { DonationActivityService } from "./donation-activity.service";

@autoInjectable()
@Controller("/api/v1/donation/activity")
@Use(AuthMiddleware.authenticate)
export class DonationActivityController {
  constructor(private readonly daService: DonationActivityService) {}

  @GET("/")
  async all(req: Request, res: Response) {
    const role = (req.user as any)?.role?.role;

    const data = await this.daService.findAll((req.user as any).id, role);

    return res.status(200).json({
      message: "Request was successful!",
      data: data,
    });
  }

  @GET("/")
  async single(req: Request<{ id: string }>, res: Response) {
    const single = await this.daService.findUnique({
      id: req.params.id,
    });

    return res.status(200).json({
      message: "Request was successful!",
      data: single,
    });
  }

  @DELETE("/:id")
  async remove(req: Request<{ id: string }>, res: Response) {
    await this.daService.update(
      { id: req.params.id },
      { deleteAt: new Date() }
    );

    return res.status(204).json({
      message: "History deleted successfully!",
      data: null,
    });
  }
}
