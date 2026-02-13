import { Op } from "sequelize";
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from "../../database/models/order.model";

/**
 * Cron to automatically update order statuses based on elapsed time
 */
export const orderStatusCron = async () => {
  try {
    const now = new Date();

    // 1️⃣ Cancel CARD orders pending > 10 minutes
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    await Order.update(
      { order_status: OrderStatus.CANCELLED, status_updated_at: now },
      {
        where: {
          order_status: OrderStatus.PAYMENT_PENDING,
          payment_status: PaymentStatus.PENDING,
          payment_method: PaymentMethod.CARD,
          created_at: { [Op.lt]: tenMinutesAgo },
        },
      }
    );

    // 2️⃣ CASH orders pending > 2 minutes → mark as PAID
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    await Order.update(
      { order_status: OrderStatus.PAID, payment_status: PaymentStatus.PAID, status_updated_at: now },
      {
        where: {
          order_status: OrderStatus.PAYMENT_PENDING,
          payment_status: PaymentStatus.PENDING,
          payment_method: PaymentMethod.CASH,
          created_at: { [Op.lt]: twoMinutesAgo },
        },
      }
    );

    // 3️⃣ PAID → ACCEPTED after 2 minutes
    const paidTwoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    await Order.update(
      { order_status: OrderStatus.ACCEPTED, status_updated_at: now },
      {
        where: {
          order_status: OrderStatus.PAID,
          status_updated_at: { [Op.lt]: paidTwoMinutesAgo },
        },
      }
    );

    // 4️⃣ ACCEPTED → COMPLETED after 5 minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    await Order.update(
      { order_status: OrderStatus.COMPLETED, status_updated_at: now },
      {
        where: {
          order_status: OrderStatus.ACCEPTED,
          status_updated_at: { [Op.lt]: fiveMinutesAgo },
        },
      }
    );

    console.log(`[Order Cron] Orders updated successfully at ${now.toISOString()}`);
  } catch (error: any) {
    console.error("[Order Cron] Error updating orders:", error.message);
  }
};
