export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED"
  | "FAILED_DELIVERY";

export const orderTimeline: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "FAILED_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"],
  DELIVERED: ["RETURN_REQUESTED"],
  CANCELLED: [],
  RETURN_REQUESTED: ["RETURNED", "REFUNDED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
  FAILED_DELIVERY: ["CONFIRMED", "CANCELLED"]
};

export class OrderStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderStateError";
  }
}

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return allowedTransitions[from].includes(to);
}

export function transitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrderStatus(from, to)) {
    throw new OrderStateError(`Cannot transition order from ${from} to ${to}.`);
  }

  return to;
}

