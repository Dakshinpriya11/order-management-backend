import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterInput, AuthUser, LoginResult } from "../../types/auth.types";
import { AppError } from "../../errors/appError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { ERROR_MESSAGES } from "../../errors/errorMessages";
import { HTTP_STATUS } from "../../errors/httpStatus";
import { User } from "../../database/models/user.model";

/**
 * Find a user by email in the database
 */
export const findUserByEmail = async (email: string): Promise<AuthUser | null> => {
  const user = await User.findOne({ where: { email } });
  return user ? user.toJSON() as AuthUser : null;
};

/**
 * Register a new user
 */
export const registerUser = async (data: RegisterInput): Promise<AuthUser> => {
  // Check if email already exists
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError(
      ERROR_CODES.USER_ALREADY_EXISTS,
      ERROR_MESSAGES.USER_ALREADY_EXISTS,
      HTTP_STATUS.CONFLICT
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user in database
  const user = await User.create({
    email: data.email,
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "USER",
  });

  // Return user without password
  const { password, ...userWithoutPassword } = user.toJSON() as any;
  return userWithoutPassword;
};

/**
 * Login user
 */
export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  const userRecord = await User.findOne({ where: { email } });

  if (!userRecord) {
    throw new AppError(
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const user = userRecord.toJSON() as AuthUser & { password: string };

  // Compare password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError(
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const token = generateToken(user);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

/**
 * Generate JWT token
 */
export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );
};
