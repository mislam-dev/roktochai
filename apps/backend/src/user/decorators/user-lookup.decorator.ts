import { Validate } from "class-validator";
import { UserLookupConstraints } from "../validators/user-lookup.validator";

export const UserLookup = () => Validate(UserLookupConstraints);
