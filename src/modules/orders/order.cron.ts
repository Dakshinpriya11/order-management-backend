import { Op } from "sequelize";
import { Server as SocketIO } from "socket.io";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../../database/models/order.model";
import { emitOrderUpdate } from "./order.events";

/**
 * Cron to automatically update order statuses based on elapsed time
 * Emits events ONLY after status is successfully updated in DB
 */
export const orderStatusCron = async (io?: SocketIO) => {
  const now = new Date();
  console.log(`[Order Cron] Cron running at ${now.toISOString()}`);

  try {
    /**
     * Helper function
     * 1. Find 
     * 2. Update them
     * 3. Fetch updated rows
     * 4. Emit updated rows
     */
    const updateAndEmit = async (
      whereCondition: any,
      updateData: any,
      logMessage: string
    ) => {
      const orders = await Order.findAll({ where: whereCondition });

      if (orders.length === 0) return;

      const ids = orders.map((o) => o.id);

      // Update DB first
      await Order.update(updateData, {
        where: { id: ids },
      });

      console.log(`${logMessage}: ${ids.length}`);

      // Fetch UPDATED rows
      const updatedOrders = await Order.findAll({
        where: { id: ids },
      });

      // Emit NEW updated rows
      updatedOrders.forEach((order) => emitOrderUpdate(order));
    };

    // 1️⃣ Cancel CARD orders pending > 10 minutes
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    await updateAndEmit(
      {
        order_status: OrderStatus.PAYMENT_PENDING,
        payment_status: PaymentStatus.PENDING,
        payment_method: PaymentMethod.CARD,
        created_at: { [Op.lt]: tenMinutesAgo },
      },
      {
        order_status: OrderStatus.CANCELLED,
        status_updated_at: now,
      },
      `[Order Cron] CARD orders cancelled`
    );

    // 2️⃣ CASH orders pending > 2 minutes → mark as PAID
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    await updateAndEmit(
      {
        order_status: OrderStatus.PAYMENT_PENDING,
        payment_status: PaymentStatus.PENDING,
        payment_method: PaymentMethod.CASH,
        created_at: { [Op.lt]: twoMinutesAgo },
      },
      {
        order_status: OrderStatus.PAID,
        payment_status: PaymentStatus.PAID,
        status_updated_at: now,
      },
      `[Order Cron] CASH orders marked PAID`
    );

    // 3️⃣ PAID → ACCEPTED after 2 minutes
    const paidTwoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    await updateAndEmit(
      {
        order_status: OrderStatus.PAID,
        status_updated_at: { [Op.lt]: paidTwoMinutesAgo },
      },
      {
        order_status: OrderStatus.ACCEPTED,
        status_updated_at: now,
      },
      `[Order Cron] Orders marked ACCEPTED`
    );

    // 4️⃣ ACCEPTED → COMPLETED after 5 minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    await updateAndEmit(
      {
        order_status: OrderStatus.ACCEPTED,
        status_updated_at: { [Op.lt]: fiveMinutesAgo },
      },
      {
        order_status: OrderStatus.COMPLETED,
        status_updated_at: now,
      },
      `[Order Cron] Orders marked COMPLETED`
    );

  } catch (error: any) {
    console.error("[Order Cron] Error updating orders:", error.message);
  }
};
