import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { AuthMiddleware } from "../auth/auth.middleware";
import { Controller } from "../core/decorator/controller.decorator";
import { UseDTO } from "../core/decorator/dto.decorator";
import { Use } from "../core/decorator/middleware.decorator";
import { DELETE, GET, PATCH, POST } from "../core/decorator/routes.decorator";
import { CreateRequestDto } from "./dtos/create-featured.dto";
import { UpdateFeaturedDto } from "./dtos/update-featured.dto";
import { FeaturedService } from "./featured.service";

@autoInjectable()
@Controller("/api/v1/featured")
@Use(AuthMiddleware.authenticate)
export class FeaturedController {
  constructor(private readonly featuredService: FeaturedService) {}

  @GET("/")
  async all(req: Request, res: Response) {
    const data = await this.featuredService.findAll();
    return res.status(200).json({
      message: "Request was successful!",
      data,
    });
  }

  @GET("/:id")
  async single(req: Request<{ id: string }>, res: Response) {
    const data = await this.featuredService.findOne(req.params.id);
    return res.status(200).json({
      message: "Request was successful!",
      data,
    });
  }

  @POST("/")
  @UseDTO(CreateRequestDto)
  async create(req: Request, res: Response) {
    const data = await this.featuredService.create(req.body);
    return res.status(201).json({
      message: "Featured added successfully!",
      data,
    });
  }

  @PATCH("/:id")
  @UseDTO(UpdateFeaturedDto)
  async update(req: Request<{ id: string }>, res: Response) {
    const data = await this.featuredService.update(req.params.id, req.body);
    return res.status(200).json({
      message: "Featured data updated successfully!",
      data,
    });
  }

  @DELETE("/")
  async remove(req: Request<{ id: string }>, res: Response) {
    await this.featuredService.softDelete(req.params.id);
    return res.status(204).json({
      message: "Featured Item deleted successfully!",
      data: null,
    });
  }
}
