import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { AuthMiddleware } from "../auth/auth.middleware";
import { Controller } from "../core/decorator/controller.decorator";
import { UseDTO } from "../core/decorator/dto.decorator";
import { Use } from "../core/decorator/middleware.decorator";
import { DELETE, GET, PATCH, POST } from "../core/decorator/routes.decorator";
import { CreateUserDto, PromoteDemoteDto } from "./dtos/create-user.dto";
import { UserService } from "./user.service";

@autoInjectable()
@Controller("/api/v1/users")
@Use([AuthMiddleware.isAuthenticate, AuthMiddleware.isSuperAdmin])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GET("/")
  async all(req: Request, res: Response) {
    const data = await this.userService.findAll();
    res
      .status(200)
      .json({ message: "Request successful", data, len: data.length });
  }

  @POST("/create")
  @UseDTO(CreateUserDto)
  async create(req: Request, res: Response) {
    const data = await this.userService.createUser(req.body);
    res
      .status(201)
      .json({ isSuccess: true, message: "User created Successfully!", data });
  }

  @GET("/single/:username")
  async single(req: Request<{ username: string }>, res: Response) {
    const data = await this.userService.findByUsernameOrEmail(
      req.params.username
    );
    res.status(200).json({ isSuccess: true, message: "User found!", data });
  }

  async updateProfile(req: Request, res: Response) {
    const userId = (req.user as any).id;
    await this.userService.updateProfile(userId, req.body);
    res.status(200).json({ message: "Profile updated successfully!" });
  }

  @GET("/roles")
  async getRoles(req: Request, res: Response) {
    const data = await this.userService.getRoles();
    res.status(200).json({ message: "Roles retrieved successfully", data });
  }

  @PATCH("/verify/:username")
  async verify(req: Request<{ username: string }>, res: Response) {
    const data = await this.userService.verifyUser(req.params.username);
    res.status(200).json({
      isSuccess: true,
      message: "User verified Successfully!",
      data,
    });
  }

  @POST("/promote")
  @UseDTO(PromoteDemoteDto)
  async promote(req: Request, res: Response) {
    const { findUserId, findUserRole } = req.body;
    const authUserId = (req.user as any).id;
    await this.userService.promoteUser(findUserId, findUserRole, authUserId);
    res
      .status(200)
      .json({ isSuccess: true, message: "User promoted successfully" });
  }

  @POST("/demote")
  @UseDTO(PromoteDemoteDto)
  async demote(req: Request, res: Response) {
    const { findUserId, findUserRole } = req.body;
    const authUserId = (req.user as any).id;
    await this.userService.demoteUser(findUserId, findUserRole, authUserId);
    res
      .status(200)
      .json({ isSuccess: true, message: "User demoted successfully" });
  }

  @DELETE("/remove/:username")
  async remove(req: Request<{ username: string }>, res: Response) {
    await this.userService.requestDeletion(req.params.username);
    res
      .status(204)
      .json({ isSuccess: true, message: "User delete request sent!" });
  }

  @DELETE("/remove/:username/confirm")
  async removeConfirm(req: Request<{ username: string }>, res: Response) {
    await this.userService.confirmDeletion(req.params.username);
    res
      .status(204)
      .json({ isSuccess: true, message: "User deleted successfully!" });
  }

  @PATCH("/single/:id")
  async update(req: Request<{ id: string }>, res: Response) {
    const data = await this.userService.updateUserInfo(req.params.id, req.body);
    res.status(200).json({ message: "User updated successfully", data });
  }
}
