import { IsNotEmpty, IsString } from "class-validator";
import { UserLookup } from "../decorators/user-lookup.decorator";

export class PromoteDemoteDto {
  @IsNotEmpty({ message: "User is required!" })
  @IsString()
  @UserLookup()
  username!: string;

  // These will be populated by UserLookup
  findUserRole?: any;
  findUserId?: string;
}
