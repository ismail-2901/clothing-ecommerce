import type { PaymentProvider, PaymentInput, PaymentResult, PaymentStatus, RefundResult } from "./payment-provider";

export class CashOnDeliveryProvider implements PaymentProvider {
  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    return {
      status: "AUTHORIZED",
      reference: `COD-${input.orderId}`,
      error: undefined
    };
  }

  async verifyPayment(reference: string): Promise<PaymentStatus> {
    return {
      status: "AUTHORIZED",
      reference,
      amount: 0,
      timestamp: new Date()
    };
  }

  async refund(orderId: string, amount: number): Promise<RefundResult> {
    return {
      success: true,
      refundId: `REFUND-${orderId}`,
      amount,
      status: "PROCESSED"
    };
  }
}

export function getPaymentProvider(provider: string): PaymentProvider {
  switch (provider) {
    case "COD":
      return new CashOnDeliveryProvider();
    default:
      throw new Error(`Payment provider not implemented: ${provider}`);
  }
}
