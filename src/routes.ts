// src/routes.ts
import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
const router = Router();

// Auth routes
router.use("/auth", authRoutes);


export default router;
