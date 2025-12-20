import express, { Router } from "express";
import { AuthMiddleware } from "../auth/auth.middleware";
import { validateDto } from "../core/validator/class-schema.validator";
import { CreateRequestDto } from "./dtos/create-featured.dto";
import { UpdateFeaturedDto } from "./dtos/update-featured.dto";
import { FeaturedController } from "./featured.controller";

const { authenticate } = new AuthMiddleware();

const { all, create, remove, single, update } = new FeaturedController();

const featuredRouter: Router = express.Router();
featuredRouter.use(authenticate);

featuredRouter.get("/", all);
featuredRouter.post("/", validateDto(CreateRequestDto), create);
featuredRouter.get("/:id", single);
featuredRouter.patch("/:id", validateDto(UpdateFeaturedDto), update);
featuredRouter.delete("/:id", remove);

export default featuredRouter;
