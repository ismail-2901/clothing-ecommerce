export interface PaymentProvider {
  createPayment(input: PaymentInput): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<PaymentStatus>;
  refund(orderId: string, amount: number): Promise<RefundResult>;
}

export type PaymentInput = {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  returnUrl: string;
};

export type PaymentResult = {
  status: "PENDING" | "AUTHORIZED" | "FAILED";
  reference: string;
  redirectUrl?: string;
  error?: string;
};

export type PaymentStatus = {
  status: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "CANCELLED";
  reference: string;
  amount: number;
  timestamp: Date;
};

export type RefundResult = {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
};

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}
