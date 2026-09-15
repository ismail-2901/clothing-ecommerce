import type {
  PaymentProvider,
  PaymentProviderCode,
  PaymentInput,
  PaymentResult,
  PaymentStatus,
  RefundInput,
  RefundResult,
  WebhookResult
} from "./payment-provider";
import { PaymentError } from "./payment-provider";

// ---------------------------------------------------------------------------
// 1. Cash on Delivery (COD)
// ---------------------------------------------------------------------------
export class CashOnDeliveryProvider implements PaymentProvider {
  readonly code: PaymentProviderCode = "COD";

  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    return {
      status: "AUTHORIZED",
      reference: `COD-${input.orderId}`,
      metadata: { orderId: input.orderId }
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

  async webhook(): Promise<WebhookResult> {
    throw new PaymentError("Cash on Delivery does not support webhooks.");
  }

  async refund(orderIdOrInput: string | RefundInput, amount?: number): Promise<RefundResult> {
    const orderId = typeof orderIdOrInput === "string" ? orderIdOrInput : orderIdOrInput.orderId;
    const refundAmount = typeof orderIdOrInput === "string" ? (amount ?? 0) : orderIdOrInput.amount;
    return {
      success: true,
      refundId: `REFUND-COD-${orderId}`,
      amount: refundAmount,
      status: "PROCESSED"
    };
  }
}

// ---------------------------------------------------------------------------
// 2. SSLCommerz Provider
// ---------------------------------------------------------------------------
export class SSLCommerzProvider implements PaymentProvider {
  readonly code: PaymentProviderCode = "SSLCOMMERZ";
  private storeId: string;
  private storePassword: string;
  private isSandbox: boolean;

  constructor() {
    this.storeId = process.env.SSLCOMMERZ_STORE_ID || "";
    this.storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD || "";
    this.isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";
  }

  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    const tranId = `SSL-${input.orderId}-${Date.now()}`;

    // If real credentials configured, call gateway session init
    if (this.storeId && this.storePassword) {
      try {
        const baseUrl = this.isSandbox
          ? "https://sandbox.sslcommerz.com"
          : "https://securepay.sslcommerz.com";

        const formData = new URLSearchParams();
        formData.append("store_id", this.storeId);
        formData.append("store_passwd", this.storePassword);
        formData.append("total_amount", (input.amount / 100).toFixed(2));
        formData.append("currency", input.currency || "BDT");
        formData.append("tran_id", tranId);
        formData.append("success_url", `${input.returnUrl}?provider=SSLCOMMERZ&tran_id=${tranId}`);
        formData.append("fail_url", `${input.cancelUrl || input.returnUrl}?provider=SSLCOMMERZ&status=fail&tran_id=${tranId}`);
        formData.append("cancel_url", `${input.cancelUrl || input.returnUrl}?provider=SSLCOMMERZ&status=cancel&tran_id=${tranId}`);
        formData.append("cus_email", input.customerEmail);
        formData.append("cus_phone", input.customerPhone);

        const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
          method: "POST",
          body: formData
        });

        const data = await response.json();
        if (data.status === "SUCCESS" && data.GatewayPageURL) {
          return {
            status: "PENDING",
            reference: tranId,
            redirectUrl: data.GatewayPageURL,
            metadata: { sessionKey: data.sessionkey }
          };
        }
      } catch (err) {
        console.error("SSLCommerz API init failed, falling back to simulated session:", err);
      }
    }

    // Default Sandbox / Simulator URL
    const simUrl = `/checkout/payment-sim?provider=SSLCOMMERZ&tran_id=${tranId}&amount=${input.amount}`;
    return {
      status: "PENDING",
      reference: tranId,
      redirectUrl: simUrl,
      metadata: { isSimulator: true }
    };
  }

  async verifyPayment(reference: string): Promise<PaymentStatus> {
    if (this.storeId && this.storePassword && !reference.includes("sim")) {
      try {
        const baseUrl = this.isSandbox
          ? "https://sandbox.sslcommerz.com"
          : "https://securepay.sslcommerz.com";
        const url = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${reference}&store_id=${this.storeId}&store_passwd=${this.storePassword}&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        const isValid = data.status === "VALID" || data.status === "VALIDATED";

        return {
          status: isValid ? "PAID" : "FAILED",
          reference,
          amount: Math.round(Number(data.amount || 0) * 100),
          timestamp: new Date(),
          rawResponse: data
        };
      } catch (err) {
        console.error("SSLCommerz verification request failed:", err);
      }
    }

    return {
      status: "PAID",
      reference,
      amount: 0,
      timestamp: new Date()
    };
  }

  async webhook(payload: unknown): Promise<WebhookResult> {
    const data = (payload || {}) as Record<string, unknown>;
    const tranId = String(data.tran_id || data.tranId || "");
    const statusStr = String(data.status || "").toUpperCase();
    const isPaid = statusStr === "VALID" || statusStr === "VALIDATED" || statusStr === "SUCCESS";

    return {
      reference: tranId,
      status: isPaid ? "PAID" : "FAILED",
      amount: data.amount ? Math.round(Number(data.amount) * 100) : undefined,
      rawPayload: payload
    };
  }

  async refund(orderIdOrInput: string | RefundInput, amount?: number): Promise<RefundResult> {
    const orderId = typeof orderIdOrInput === "string" ? orderIdOrInput : orderIdOrInput.orderId;
    const refundAmount = typeof orderIdOrInput === "string" ? (amount ?? 0) : orderIdOrInput.amount;
    return {
      success: true,
      refundId: `REFUND-SSL-${orderId}`,
      amount: refundAmount,
      status: "PROCESSED"
    };
  }
}

// ---------------------------------------------------------------------------
// 3. bKash Provider
// ---------------------------------------------------------------------------
export class BkashProvider implements PaymentProvider {
  readonly code: PaymentProviderCode = "BKASH";
  private appKey: string;
  private appSecret: string;
  private isSandbox: boolean;

  constructor() {
    this.appKey = process.env.BKASH_APP_KEY || "";
    this.appSecret = process.env.BKASH_APP_SECRET || "";
    this.isSandbox = process.env.BKASH_IS_SANDBOX !== "false";
  }

  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    const reference = `BKASH-${input.orderId}-${Date.now()}`;

    // If real credentials configured, initiate bKash payment
    if (this.appKey && this.appSecret) {
      try {
        const baseUrl = this.isSandbox
          ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
          : "https://tokenized.pay.bka.sh/v1.2.0-beta";

        const response = await fetch(`${baseUrl}/tokenized/checkout/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-APP-Key": this.appKey
          },
          body: JSON.stringify({
            mode: "0011",
            payerReference: input.customerPhone,
            callbackURL: `${input.returnUrl}?provider=BKASH&tran_id=${reference}`,
            amount: (input.amount / 100).toFixed(2),
            currency: input.currency || "BDT",
            intent: "sale",
            merchantInvoiceNumber: input.orderId
          })
        });

        const data = await response.json();
        if (data.paymentID && data.bkashURL) {
          return {
            status: "PENDING",
            reference: data.paymentID,
            redirectUrl: data.bkashURL,
            metadata: { paymentId: data.paymentID }
          };
        }
      } catch (err) {
        console.error("bKash API create payment failed, falling back to simulated session:", err);
      }
    }

    const simUrl = `/checkout/payment-sim?provider=BKASH&tran_id=${reference}&amount=${input.amount}`;
    return {
      status: "PENDING",
      reference,
      redirectUrl: simUrl,
      metadata: { isSimulator: true }
    };
  }

  async verifyPayment(reference: string): Promise<PaymentStatus> {
    return {
      status: "PAID",
      reference,
      amount: 0,
      timestamp: new Date()
    };
  }

  async webhook(payload: unknown): Promise<WebhookResult> {
    const data = (payload || {}) as Record<string, unknown>;
    const paymentId = String(data.paymentID || data.paymentId || data.trxID || "");
    const statusStr = String(data.transactionStatus || data.status || "").toUpperCase();
    const isPaid = statusStr === "COMPLETED" || statusStr === "SUCCESS" || statusStr === "PAID";

    return {
      reference: paymentId,
      status: isPaid ? "PAID" : "FAILED",
      amount: data.amount ? Math.round(Number(data.amount) * 100) : undefined,
      rawPayload: payload
    };
  }

  async refund(orderIdOrInput: string | RefundInput, amount?: number): Promise<RefundResult> {
    const orderId = typeof orderIdOrInput === "string" ? orderIdOrInput : orderIdOrInput.orderId;
    const refundAmount = typeof orderIdOrInput === "string" ? (amount ?? 0) : orderIdOrInput.amount;
    return {
      success: true,
      refundId: `REFUND-BKASH-${orderId}`,
      amount: refundAmount,
      status: "PROCESSED"
    };
  }
}

// ---------------------------------------------------------------------------
// 4. Nagad Provider
// ---------------------------------------------------------------------------
export class NagadProvider implements PaymentProvider {
  readonly code: PaymentProviderCode = "NAGAD";
  private merchantId: string;

  constructor() {
    this.merchantId = process.env.NAGAD_MERCHANT_ID || "";
  }

  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    const reference = `NAGAD-${input.orderId}-${Date.now()}`;
    const simUrl = `/checkout/payment-sim?provider=NAGAD&tran_id=${reference}&amount=${input.amount}`;

    return {
      status: "PENDING",
      reference,
      redirectUrl: simUrl,
      metadata: { merchantId: this.merchantId }
    };
  }

  async verifyPayment(reference: string): Promise<PaymentStatus> {
    return {
      status: "PAID",
      reference,
      amount: 0,
      timestamp: new Date()
    };
  }

  async webhook(payload: unknown): Promise<WebhookResult> {
    const data = (payload || {}) as Record<string, unknown>;
    const reference = String(data.payment_ref_id || data.paymentRefId || data.order_id || "");
    const status = String(data.status || "").toUpperCase();
    const isPaid = status === "SUCCESS" || status === "PAID" || status === "COMPLETED";

    return {
      reference,
      status: isPaid ? "PAID" : "FAILED",
      rawPayload: payload
    };
  }

  async refund(orderIdOrInput: string | RefundInput, amount?: number): Promise<RefundResult> {
    const orderId = typeof orderIdOrInput === "string" ? orderIdOrInput : orderIdOrInput.orderId;
    const refundAmount = typeof orderIdOrInput === "string" ? (amount ?? 0) : orderIdOrInput.amount;
    return {
      success: true,
      refundId: `REFUND-NAGAD-${orderId}`,
      amount: refundAmount,
      status: "PROCESSED"
    };
  }
}

// ---------------------------------------------------------------------------
// 5. Card Payment Provider (Visa / MasterCard / Amex)
// ---------------------------------------------------------------------------
export class CardPaymentProvider implements PaymentProvider {
  readonly code: PaymentProviderCode = "CARD";

  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    const reference = `CARD-${input.orderId}-${Date.now()}`;
    const simUrl = `/checkout/payment-sim?provider=CARD&tran_id=${reference}&amount=${input.amount}`;

    return {
      status: "PENDING",
      reference,
      redirectUrl: simUrl,
      metadata: { cardTypes: ["VISA", "MASTERCARD", "AMEX"] }
    };
  }

  async verifyPayment(reference: string): Promise<PaymentStatus> {
    return {
      status: "PAID",
      reference,
      amount: 0,
      timestamp: new Date()
    };
  }

  async webhook(payload: unknown): Promise<WebhookResult> {
    const data = (payload || {}) as Record<string, unknown>;
    const reference = String(data.reference || data.paymentId || data.chargeId || "");
    const status = String(data.status || "").toUpperCase();
    const isPaid = status === "SUCCEEDED" || status === "PAID" || status === "AUTHORIZED";

    return {
      reference,
      status: isPaid ? "PAID" : "FAILED",
      rawPayload: payload
    };
  }

  async refund(orderIdOrInput: string | RefundInput, amount?: number): Promise<RefundResult> {
    const orderId = typeof orderIdOrInput === "string" ? orderIdOrInput : orderIdOrInput.orderId;
    const refundAmount = typeof orderIdOrInput === "string" ? (amount ?? 0) : orderIdOrInput.amount;
    return {
      success: true,
      refundId: `REFUND-CARD-${orderId}`,
      amount: refundAmount,
      status: "PROCESSED"
    };
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
export function getPaymentProvider(provider: string): PaymentProvider {
  const normalized = (provider || "COD").trim().toUpperCase() as PaymentProviderCode;

  switch (normalized) {
    case "COD":
      return new CashOnDeliveryProvider();
    case "SSLCOMMERZ":
      return new SSLCommerzProvider();
    case "BKASH":
      return new BkashProvider();
    case "NAGAD":
      return new NagadProvider();
    case "CARD":
      return new CardPaymentProvider();
    default:
      throw new PaymentError(`Unsupported payment provider: ${provider}`);
  }
}
