import { z } from "zod";

/**
 * Register Schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password is too long" }),

  firstName: z
    .string()
    .trim()
    .min(2, { message: "First name must be at least 2 characters" }),

  lastName: z
    .string()
    .trim()
    .optional(),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});
