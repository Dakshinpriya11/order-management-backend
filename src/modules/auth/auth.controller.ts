import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validation";
import { registerUser, loginUser } from "./auth.service";
import { AppError } from "../../errors/appError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { ERROR_MESSAGES } from "../../errors/errorMessages";
import { HTTP_STATUS } from "../../errors/httpStatus";

/**
 * REGISTER
 */
export const register = async (req: Request, res: Response) => {
  const validation = registerSchema.safeParse(req.body);

  // Zod validation error
  if (!validation.success) {
    const firstError = validation.error.issues[0];

    throw new AppError(
      ERROR_CODES.AUTH_MISSING_CREDENTIALS,
      firstError.message,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const user = await registerUser(validation.data);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "User registered",
    data: user,
  });
};


/**
 * LOGIN
 */
export const login = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);

  // Zod validation error
  if (!validation.success) {
    throw new AppError(
      ERROR_CODES.AUTH_MISSING_CREDENTIALS,
      ERROR_MESSAGES.AUTH_MISSING_CREDENTIALS,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const result = await loginUser(
    validation.data.email,
    validation.data.password
  );

  if (!result) {
    throw new AppError(
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // IMPORTANT: result is { user, token }
  res.status(HTTP_STATUS.OK).json({
    success: true,
    token: result.token,
  });
};
