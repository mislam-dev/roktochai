import { Validate } from "class-validator";
import { IsEmailUniqueConstraints } from "../validators/is-email-unique-constraints.validator";

export const IsEmailUnique = () => Validate(IsEmailUniqueConstraints);
