
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";
import { HTTP_STATUS } from "../errors/httpStatus";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // logs to console

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // fallback for unknown errors
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: err.message || "Something went wrong",
  });
};
