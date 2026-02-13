import { Order } from "../../database/models/order.model";
import { getIo } from "../../socket"; 

export const emitOrderUpdate = (order: Order) => {
  try {
    const io = getIo();

    io.to(order.id).emit("orderUpdated", order);

    console.log(
      `[Order Emit] Emitted update for Order ID: ${order.id}, New Status: ${order.order_status}`
    );
  } catch (err: any) {
    console.error("[Order Emit] Failed to emit order update:", err.message);
  }
};
