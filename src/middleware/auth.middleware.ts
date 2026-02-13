import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/appError";
import { ERROR_CODES } from "../errors/errorCodes";
import { HTTP_STATUS } from "../errors/httpStatus";
import { env } from "../config/env";

interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, "Authorization header missing", HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload; 

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        message: "Token expired",
      });
    }
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      message: "Invalid token",
    });
  }
};
