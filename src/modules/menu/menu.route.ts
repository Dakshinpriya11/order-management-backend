import { Router } from "express";
import * as controller from "./menu.controller";

const router = Router();

// Get all menu items
router.get("/", controller.getMenuItems);

// Create new menu item
router.post("/", controller.createMenuItem);

export default router;
