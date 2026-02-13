// src/modules/orders/order.validation.ts
import { z } from "zod";

export const createOrderSchema = z.object({
  payment_method: z.enum(["CASH", "CARD"]),
  items: z.array(
    z.object({
      menu_item_id: z.string().uuid(),
      quantity: z.number().min(1),
    })
  ),
});
