import { Validate } from "class-validator";
import { IsRoleValidConstraints } from "../validators/is-role-valid-constraints.validator";

export const IsRoleValid = () => Validate(IsRoleValidConstraints);
