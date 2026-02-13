// src/modules/orders/order.controller.ts
import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { PaymentMethod } from "../../database/models/order.model";
import { AppError } from "../../errors/appError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { HTTP_STATUS } from "../../errors/httpStatus";

export class OrderController {
  /** Create a new order */
  static async createOrder(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new AppError(
          ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          "User not authenticated",
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const user_id = req.user.id;
      const idempotency_key = req.headers["idempotency-key"] as string;
      const { items, payment_method } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR,
          "Order must contain at least one item",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (!payment_method) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR,
          "Payment method is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const order = await OrderService.createOrder(
        user_id,
        payment_method as PaymentMethod,
        items,
        idempotency_key
      );

      return res.status(201).json({ success: true, order });
    } catch (err: any) {
      const status = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        success: false,
        code: err.code || "INTERNAL_ERROR",
        message: err.message || "Something went wrong",
      });
    }
  }

  /** Get all orders for the current user, optional filtering by status/date */
  static async getOrders(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(
          ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          "User not authenticated",
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const user_id = req.user.id;
      const { status, startDate, endDate } = req.query;

      const orders = await OrderService.getOrders(
        user_id,
        status as string,
        startDate as string,
        endDate as string
      );

      return res.json({ success: true, orders });
    } catch (err: any) {
      const status = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        success: false,
        code: err.code || "INTERNAL_ERROR",
        message: err.message || "Something went wrong",
      });
    }
  }

  /** Get single order by ID for current user */
  static async getOrderById(req: Request, res: Response) {
  try {
    // ✅ Ensure user is authenticated
    if (!req.user) {
      throw new AppError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "User not authenticated",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const user_id = req.user.id;

    // ✅ Normalize id from params to string
    let { id } = req.params;
    if (Array.isArray(id)) {
      id = id[0];
    }

    const order = await OrderService.getOrderById(id, user_id);

    if (!order) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        `Order ${id} not found`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return res.json({ success: true, order });
  } catch (err: any) {
    const status = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return res.status(status).json({
      success: false,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Something went wrong",
    });
  }
}
}