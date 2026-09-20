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
  /**
   * Verify the incoming webhook signature/shared secret BEFORE processing.
   * Implementations must throw WebhookVerificationError if the signature is invalid.
   * Returns true if the signature is valid (or if the provider does not support signatures,
   * in which case it must still validate against a shared WEBHOOK_SECRET env var).
   */
  verifyWebhookSignature(payload: unknown, headers: Headers | Record<string, string>): Promise<void>;
  webhook(payload: unknown, headers?: Headers | Record<string, string>): Promise<WebhookResult>;
  refund(orderIdOrInput: string | RefundInput, amount?: number, reason?: string): Promise<RefundResult>;
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

/** Thrown by verifyWebhookSignature when the request fails authentication. */
export class WebhookVerificationError extends Error {
  constructor(message = "Webhook signature verification failed") {
    super(message);
    this.name = "WebhookVerificationError";
  }
}
