// src/modules/orders/order.service.ts
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from "../../database/models/order.model";
import { OrderItem } from "../../database/models/orderItem.model";
import { MenuItem } from "../../database/models/menuItem.model";
import { AppError } from "../../errors/appError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { HTTP_STATUS } from "../../errors/httpStatus";
import { sequelize } from "../../config/db";
import { Op } from "sequelize";
import { emitOrderUpdate } from "./order.events";

interface OrderItemInput {
  menu_item_id: string;
  quantity: number;
}

export class OrderService {
  // ===================== Create Order =====================
  static async createOrder(
    user_id: string,
    payment_method: PaymentMethod,
    items: OrderItemInput[],
    idempotency_key?: string
  ) {
    // Check idempotency: return existing order if same key is used
    if (idempotency_key) {
      const existing = await Order.findOne({ where: { idempotency_key }, include: [{ model: OrderItem, as: "items" }] });
      if (existing) return existing;
    }

    return sequelize.transaction(async (t) => {
      let total_amount = 0;

      // First create the order with temporary total_amount
      const order = await Order.create(
        {
          user_id,
          payment_method,
          order_status: OrderStatus.PAYMENT_PENDING,
          payment_status: PaymentStatus.PENDING,
          total_amount: 0, // temporary
          idempotency_key,
          status_updated_at: new Date(),
        },
        { transaction: t }
      );

      // Prepare order items
      const orderItemsData = [];

      for (const item of items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id);
        if (!menuItem) {
          throw new AppError(
            ERROR_CODES.NOT_FOUND,
            `Menu item ${item.menu_item_id} not found`,
            HTTP_STATUS.NOT_FOUND
          );
        }

        const price = Number(menuItem.price);
        total_amount += price * item.quantity;

        orderItemsData.push({
          order_id: order.id, // must include order_id
          menu_item_id: item.menu_item_id,
          price,
          quantity: item.quantity,
        });
      }

      // Bulk create order items
      await OrderItem.bulkCreate(orderItemsData, { transaction: t });

      // Update total_amount in order
      order.total_amount = total_amount;
      await order.save({ transaction: t });

      // Return order with items
      const savedOrder = await Order.findOne({
        where: { id: order.id },
        include: [{ model: OrderItem, as: "items" }],
        transaction: t,
      });

      return savedOrder!;
    });
  }

  // ===================== Get Orders =====================
  static async getOrders(
    user_id: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ) {
    const where: any = { user_id };

    if (status) where.order_status = status;

    if (startDate || endDate) where.created_at = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // include entire start day
      where.created_at[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // include entire end day
      where.created_at[Op.lte] = end;
    }

    return Order.findAll({
      where,
      include: [{ model: OrderItem, as: "items" }],
      order: [["created_at", "DESC"]],
    });
  }

  // ===================== Get Order By ID =====================
  static async getOrderById(order_id: string, user_id: string) {
    return Order.findOne({
      where: { id: order_id, user_id },
      include: [{ model: OrderItem, as: "items" }],
    });
  }

  static async confirmPayment(orderId: string) {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.order_status !== OrderStatus.PAYMENT_PENDING) {
    throw new Error("Order is not in PAYMENT_PENDING state");
  }

  if (order.payment_method !== PaymentMethod.CARD) {
    throw new Error("Only CARD payments can be confirmed manually");
  }

  const now = new Date();

  await order.update({
    payment_status: PaymentStatus.PAID,
    order_status: OrderStatus.PAID,
    status_updated_at: now,
  });

  // Emit updated order
  await emitOrderUpdate(order);

  return order;
}

static async cancelOrder(orderId: string, userId: string) {
  const order = await Order.findOne({
    where: {
      id: orderId,
      user_id: userId,
    },
  });

  if (!order) {
    throw new AppError(
      ERROR_CODES.NOT_FOUND,
      "Order not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const cancelableStatuses = [
    OrderStatus.PAYMENT_PENDING,
    OrderStatus.PAID,
  ];

  if (!cancelableStatuses.includes(order.order_status)) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Cannot cancel order at this stage",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const now = new Date();

  await order.update({
    order_status: OrderStatus.CANCELLED,
    status_updated_at: now,
  });

  await emitOrderUpdate(order);

  return order;
}


}
