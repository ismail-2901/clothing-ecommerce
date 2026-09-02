export type PaymentProviderCode = "COD" | "SSLCOMMERZ" | "BKASH" | "NAGAD" | "CARD";

export type PaymentRequest = {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
};

export type PaymentResult = {
  provider: PaymentProviderCode;
  providerPaymentId: string;
  status: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED";
  redirectUrl?: string;
};

export type RefundRequest = {
  paymentId: string;
  amount: number;
  reason: string;
};

export interface PaymentProvider {
  code: PaymentProviderCode;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(providerPaymentId: string): Promise<PaymentResult>;
  refundPayment(request: RefundRequest): Promise<{ refundId: string; status: "PENDING" | "SUCCEEDED" | "FAILED" }>;
  handleWebhook(payload: unknown, headers: Headers): Promise<PaymentResult>;
}

export const cashOnDeliveryProvider: PaymentProvider = {
  code: "COD",
  async createPayment(request) {
    return {
      provider: "COD",
      providerPaymentId: `cod_${request.orderId}`,
      status: "PENDING"
    };
  },
  async verifyPayment(providerPaymentId) {
    return {
      provider: "COD",
      providerPaymentId,
      status: "PENDING"
    };
  },
  async refundPayment(request) {
    return {
      refundId: `cod_refund_${request.paymentId}`,
      status: "PENDING"
    };
  },
  async handleWebhook() {
    throw new Error("Cash on Delivery does not support webhooks.");
  }
};

