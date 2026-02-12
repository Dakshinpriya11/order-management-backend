import { Router } from "express";
import { register, login } from "./auth.controller";
import { validate } from "../../middleware/validation.middleware"; // Zod validation middleware
import { registerSchema, loginSchema } from "./auth.validation";

const router = Router();

// Register route with validation
router.post("/register", validate(registerSchema), register);

// Login route with validation
router.post("/login", validate(loginSchema), login);

export default router;
