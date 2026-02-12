// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import { AppError } from "../errors/appError";
import { ERROR_CODES } from "../errors/errorCodes";
import { HTTP_STATUS } from "../errors/httpStatus";

export const validate = (schema: ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // only validate body
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const firstError = err.issues[0];
        return next(
          new AppError(
            ERROR_CODES.AUTH_INVALID_INPUT || "AUTH_005",
            `Invalid input: ${firstError.message}`,
            HTTP_STATUS.BAD_REQUEST
          )
        );
      }
      next(err);
    }
  };
};
