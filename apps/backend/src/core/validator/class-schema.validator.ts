import { plainToInstance } from "class-transformer";
import { validate as classValidate } from "class-validator";
import { NextFunction, Request, Response } from "express";
export const validate = async (dtoClass: any, data: any) => {
  const output = plainToInstance(dtoClass, data);
  const errors = await classValidate(output);

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints || [],
    }));
    return {
      errors: errorMessages,
      output: null,
    };
  }

  return {
    errors: [],
    output,
  };
};
export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors, output } = await validate(dtoClass, req.body);
      if (errors.length > 0) throw new Error(JSON.stringify(errors));
      req.body = output;
      return next();
    } catch (error) {
      next(error);
    }
  };
};
