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
    console.log('[AUTH DEBUG] Incoming request URL:', req.originalUrl);
    console.log('[AUTH DEBUG] Authorization header:', req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn('[AUTH DEBUG] Authorization header missing or invalid');
      throw new AppError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Authorization header missing",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const token = authHeader.split(" ")[1];
    console.log('[AUTH DEBUG] Token extracted:', token);

    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload; 
    console.log('[AUTH DEBUG] Token decoded payload:', decoded);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err: any) {
    console.error('[AUTH DEBUG] Token verification error:', err);

    if (err.name === "TokenExpiredError") {
      console.warn('[AUTH DEBUG] Token expired');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        message: "Token expired",
      });
    }

    console.warn('[AUTH DEBUG] Invalid token');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      message: "Invalid token",
    });
  }
};
