// src/routes.ts
import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import menuRoutes from "./modules/menu/menu.route";
import orderRoutes from "./modules/orders/order.route";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);

export default router;
