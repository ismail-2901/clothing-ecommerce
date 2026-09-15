export type PaymentProviderCode = "COD" | "SSLCOMMERZ" | "BKASH" | "NAGAD" | "CARD";

export type PaymentInput = {
  orderId: string;
  orderNumber?: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  returnUrl: string;
  cancelUrl?: string;
};

export type PaymentResult = {
  status: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED";
  reference: string;
  redirectUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
};

export type PaymentStatus = {
  status: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "CANCELLED";
  reference: string;
  amount: number;
  currency?: string;
  timestamp: Date;
  rawResponse?: unknown;
};

export type RefundInput = {
  orderId: string;
  amount: number;
  reason?: string;
  paymentReference?: string;
};

export type RefundResult = {
  success: boolean;
  refundId: string;
  amount: number;
  status: "PENDING" | "PROCESSED" | "FAILED";
  error?: string;
};

export type WebhookResult = {
  orderId?: string;
  reference: string;
  status: "PAID" | "FAILED" | "CANCELLED" | "PENDING";
  amount?: number;
  rawPayload?: unknown;
};

export interface PaymentProvider {
  readonly code: PaymentProviderCode;
  createPayment(input: PaymentInput): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<PaymentStatus>;
  webhook(payload: unknown, headers?: Headers | Record<string, string>): Promise<WebhookResult>;
  refund(orderIdOrInput: string | RefundInput, amount?: number, reason?: string): Promise<RefundResult>;
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}
