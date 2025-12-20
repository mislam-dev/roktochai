import { NextFunction, Request, Response } from "express";
import { FeaturedService } from "./featured.service";

export class FeaturedController {
  constructor(
    private readonly featuredService: FeaturedService = new FeaturedService()
  ) {}

  all = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.featuredService.findAll();
      return res.status(200).json({
        message: "Request was successful!",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  single = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.featuredService.findOne(req.params.id);
      return res.status(200).json({
        message: "Request was successful!",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.featuredService.create(req.body);
      return res.status(201).json({
        message: "Featured added successfully!",
        data,
      });
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
      const data = await this.featuredService.update(req.params.id, req.body);
      return res.status(200).json({
        message: "Featured data updated successfully!",
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
      await this.featuredService.softDelete(req.params.id);
      return res.status(204).json({
        message: "Featured Item deleted successfully!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
