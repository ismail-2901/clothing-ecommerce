import { randomBytes } from "node:crypto";

export type CreateOrderInput = {
  customerId?: string;
  email: string;
  phone: string;
  deliveryAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    area?: string;
    postalCode?: string;
    country: string;
  };
  cartItems: Array<{
    sku: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingFee: number;
  couponCode?: string;
  paymentProvider: "COD" | "SSLCOMMERZ" | "BKASH" | "NAGAD" | "CARD";
};

export type OrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    sku: string;
    quantity: number;
    price: number;
  }>;
  paymentUrl?: string;
};

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

export function generateOrderNumber(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  // BUG-39 FIX: 48 bits of cryptographically secure random entropy avoids collisions under load
  const random = randomBytes(6).toString("hex").toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
