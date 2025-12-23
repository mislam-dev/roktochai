import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { AuthMiddleware } from "../auth/auth.middleware";
import { Controller } from "../core/decorator/controller.decorator";
import { UseDTO } from "../core/decorator/dto.decorator";
import { Use } from "../core/decorator/middleware.decorator";
import { DELETE, GET, POST, PUT } from "../core/decorator/routes.decorator";
import { DonationRequestService } from "./donation-request.service";
import { AssignDonorDto } from "./dtos/asign-donor.dto";
import { CreateRequestDto } from "./dtos/create.dto";
import { FinderDonorDto } from "./dtos/find-donor.dto";

@autoInjectable()
@Controller("/api/v1/donation/requested")
@Use(AuthMiddleware.authenticate)
export class DonationRequestController {
  constructor(private readonly drService: DonationRequestService) {}

  @GET("/")
  async all(req: Request, res: Response) {
    const role = (req.user as any)?.role?.role;

    const data = await this.drService.findAll(role, (req.user as any).id);

    return res.status(200).json({
      message: "Request was successful!",
      data: data,
    });
  }

  @POST("/")
  @UseDTO(CreateRequestDto)
  async create(req: Request, res: Response) {
    const item = await this.drService.create(req.body, req.user);

    return res.status(201).json({
      message:
        "Your request has been accepted! We will let you know via email or call you directly!",
      data: item,
    });
  }

  @GET("/:id")
  async single(req: Request<{ id: string }>, res: Response) {
    const single = await this.drService.single(req.params.id);

    return res.status(200).json({
      message: "Request was successful!",
      data: single,
    });
  }

  @PUT("/approve/:id")
  @Use(AuthMiddleware.isAdmin)
  async approve(req: Request<{ id: string }>, res: Response) {
    await this.drService.approve(req.params.id, req.user);

    return res.status(202).json({
      message: "Donation request approved!",
      data: null,
    });
  }

  @PUT("/complete/:id")
  @Use(AuthMiddleware.isAdmin)
  async complete(req: Request<{ id: string }>, res: Response) {
    this.drService.complete(req.params.id, req.user);

    return res.status(200).json({
      message: "Donation request completed!",
      data: null,
    });
  }

  @PUT("/decline/:id")
  @Use(AuthMiddleware.isAdmin)
  async decline(req: Request<{ id: string }, {}, {}>, res: Response) {
    await this.drService.decline(req.params.id, req.user);

    return res.status(202).json({
      message: "Donation request approved!",
      data: null,
    });
  }
  @PUT("/progress/:id")
  @Use(AuthMiddleware.isAdmin)
  async progress(req: Request<{ id: string }>, res: Response) {
    await this.drService.progress(req.params.id, req.user);

    return res.status(202).json({
      message: "Donation status updated!",
      data: null,
    });
  }

  @PUT("/assign/:id")
  @Use(AuthMiddleware.isAdmin)
  @UseDTO(AssignDonorDto)
  async assign(
    req: Request<{ id: string }, {}, AssignDonorDto>,
    res: Response
  ) {
    const donorData = await this.drService.assign(
      req.params.id,
      req.body.donorId,
      req.user
    );

    return res.status(200).json({
      message: "Donor assigned successfully",
      data: donorData,
    });
  }

  @PUT("/hold/:id")
  @Use(AuthMiddleware.isAdmin)
  async hold(req: Request<{ id: string }>, res: Response) {
    await this.drService.hold(req.params.id, req.user); //

    return res.status(202).json({
      message: "Donation status updated to hold!",
      data: null,
    });
  }

  @DELETE("/:id")
  @Use(AuthMiddleware.isSuperAdmin)
  async remove(req: Request<{ id: string }>, res: Response) {
    await this.drService.softRemove(req.params.id, req.user); //

    return res.status(204).json({
      message: "Donation request removed successfully!",
      data: null,
    });
  }

  @POST("/find-donor")
  @Use(AuthMiddleware.isAdmin)
  @UseDTO(FinderDonorDto)
  async findDonor(req: Request<{}, {}, FinderDonorDto>, res: Response) {
    const { date, blood } = req.body;
    const donors = await this.drService.findAvailableDonors(blood, date);

    return res.status(200).json({
      message: "Request accepted! Potential donors found.",
      data: donors,
    });
  }

  @GET("/contribution/:username")
  @Use(AuthMiddleware.isAdmin)
  async userContribution(req: Request<{ username: string }>, res: Response) {
    const stats = await this.drService.userContributionStats(
      req.params.username
    );

    return res.status(200).json({
      message: "Stats generated successfully",
      data: stats,
    });
  }
}
