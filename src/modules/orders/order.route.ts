import { Router } from "express";
import { OrderController } from "./order.controller";
import { validate } from "../../middleware/validation.middleware";
import { createOrderSchema } from "./order.validation";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, validate(createOrderSchema), OrderController.createOrder);
router.get("/", authMiddleware, OrderController.getOrders);
router.get("/:id", authMiddleware, OrderController.getOrderById);
router.post("/:orderId/confirm-payment",authMiddleware, OrderController.confirmPayment);


export default router;
