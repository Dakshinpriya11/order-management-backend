// src/types/order.types.ts

/**
 * Order item input used while creating order
 */
export type OrderItemInput = {
  menu_item_id: string;
  quantity: number;
};

/**
 * Confirm payment route params
 */
export type ConfirmPaymentParams = {
  orderId: string;
};
