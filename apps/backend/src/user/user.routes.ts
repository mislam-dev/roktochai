import express, { Router } from "express";
import { AuthMiddleware } from "../auth/auth.middleware";
import { validateDto } from "../core/validator/class-schema.validator";
import { CreateUserDto, PromoteDemoteDto } from "./dtos/create-user.dto";
import { UserController } from "./user.controller";

const { authenticate, isSuperAdmin } = new AuthMiddleware();

const {
  all,
  create,
  promote,
  single,
  demote,
  getRoles,
  remove,
  removeConfirm,
  update,
  verify,
} = new UserController();

const authRouter: Router = express.Router();
authRouter.use(authenticate);
authRouter.use(isSuperAdmin);
authRouter.get("/", all);
authRouter.get("/roles", getRoles);
authRouter.patch("/verify/:username", verify);
authRouter.post("/create", validateDto(CreateUserDto), create);
authRouter.get("/single/:username", single);
authRouter.patch("/single/:id", update);
authRouter.delete("/remove/:username", remove);
authRouter.delete("/remove/:username/confirm", removeConfirm);
authRouter.post("/promote", validateDto(PromoteDemoteDto), promote);
authRouter.post("/demote", validateDto(PromoteDemoteDto), demote);

export default authRouter;
