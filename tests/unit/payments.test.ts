import { describe, it, expect } from "vitest";
import {
  getPaymentProvider,
  CashOnDeliveryProvider,
  SSLCommerzProvider,
  BkashProvider,
  NagadProvider,
  CardPaymentProvider
} from "@/lib/payments/providers";
import { PaymentError } from "@/lib/payments/payment-provider";

describe("Payment Providers Factory", () => {
  it("resolves all 5 supported payment providers", () => {
    expect(getPaymentProvider("COD")).toBeInstanceOf(CashOnDeliveryProvider);
    expect(getPaymentProvider("SSLCOMMERZ")).toBeInstanceOf(SSLCommerzProvider);
    expect(getPaymentProvider("BKASH")).toBeInstanceOf(BkashProvider);
    expect(getPaymentProvider("NAGAD")).toBeInstanceOf(NagadProvider);
    expect(getPaymentProvider("CARD")).toBeInstanceOf(CardPaymentProvider);
  });

  it("handles case-insensitive provider codes", () => {
    expect(getPaymentProvider("cod")).toBeInstanceOf(CashOnDeliveryProvider);
    expect(getPaymentProvider("bkash")).toBeInstanceOf(BkashProvider);
    expect(getPaymentProvider("sslcommerz")).toBeInstanceOf(SSLCommerzProvider);
  });

  it("throws PaymentError on unsupported provider", () => {
    expect(() => getPaymentProvider("CRYPTO")).toThrow(PaymentError);
    expect(() => getPaymentProvider("PAYPAL")).toThrow("Unsupported payment provider: PAYPAL");
  });
});

describe("CashOnDeliveryProvider", () => {
  const provider = new CashOnDeliveryProvider();

  it("creates payment in AUTHORIZED state", async () => {
    const result = await provider.createPayment({
      orderId: "ord_123",
      amount: 250000,
      currency: "BDT",
      customerEmail: "user@example.com",
      customerPhone: "01711111111",
      description: "Order ord_123",
      returnUrl: "http://localhost/checkout/confirm"
    });

    expect(result.status).toBe("AUTHORIZED");
    expect(result.reference).toBe("COD-ord_123");
  });

  it("verifies payment reference as AUTHORIZED", async () => {
    const status = await provider.verifyPayment("COD-ord_123");
    expect(status.status).toBe("AUTHORIZED");
  });

  it("throws on webhook invocation", async () => {
    await expect(provider.webhook()).rejects.toThrow("Cash on Delivery does not support webhooks");
  });

  it("processes refund", async () => {
    const result = await provider.refund("ord_123", 250000);
    expect(result.success).toBe(true);
    expect(result.status).toBe("PROCESSED");
    expect(result.refundId).toMatch(/^COD-REFUND-ord_123/);
  });
});

describe("SSLCommerzProvider", () => {
  const provider = new SSLCommerzProvider();

  it("creates payment in PENDING state with redirectUrl", async () => {
    const result = await provider.createPayment({
      orderId: "ord_456",
      amount: 450000,
      currency: "BDT",
      customerEmail: "user@example.com",
      customerPhone: "01711111111",
      description: "Order ord_456",
      returnUrl: "http://localhost/checkout/confirm"
    });

    expect(result.status).toBe("PENDING");
    expect(result.reference).toContain("SSL-ord_456");
    expect(result.redirectUrl).toBeDefined();
  });

  it("verifies payment reference fails closed without credentials", async () => {
    const status = await provider.verifyPayment("SSL-ord_456");
    expect(status.status).toBe("FAILED");
  });

  it("parses valid and invalid IPN webhook payloads", async () => {
    const valid = await provider.webhook({ tran_id: "SSL-ord_456", status: "VALID", amount: "450.00" });
    expect(valid.status).toBe("PAID");
    expect(valid.reference).toBe("SSL-ord_456");

    const failed = await provider.webhook({ tran_id: "SSL-ord_456", status: "FAILED" });
    expect(failed.status).toBe("FAILED");
  });

  it("fails closed on refund when credentials not configured", async () => {
    await expect(provider.refund("ord_456", 450000)).rejects.toThrow("credentials not configured");
  });
});

describe("BkashProvider", () => {
  const provider = new BkashProvider();

  it("creates payment in PENDING state with redirectUrl", async () => {
    const result = await provider.createPayment({
      orderId: "ord_789",
      amount: 120000,
      currency: "BDT",
      customerEmail: "user@example.com",
      customerPhone: "01711111111",
      description: "Order ord_789",
      returnUrl: "http://localhost/checkout/confirm"
    });

    expect(result.status).toBe("PENDING");
    expect(result.reference).toContain("BKASH-ord_789");
    expect(result.redirectUrl).toBeDefined();
  });

  it("parses bKash webhook notification", async () => {
    const completed = await provider.webhook({ paymentID: "bkash_pid_1", transactionStatus: "Completed" });
    expect(completed.status).toBe("PAID");

    const cancelled = await provider.webhook({ paymentID: "bkash_pid_1", transactionStatus: "Cancelled" });
    expect(cancelled.status).toBe("FAILED");
  });

  it("fails closed on refund since direct API is not integrated", async () => {
    await expect(provider.refund("ord_789", 120000)).rejects.toThrow("bKash refund is not yet integrated");
  });
});

describe("NagadProvider and CardPaymentProvider", () => {
  it("Nagad creates payment and verifies", async () => {
    const nagad = new NagadProvider();
    const res = await nagad.createPayment({
      orderId: "ord_ngd",
      amount: 300000,
      currency: "BDT",
      customerEmail: "user@example.com",
      customerPhone: "01711111111",
      description: "Order ord_ngd",
      returnUrl: "http://localhost/checkout/confirm"
    });
    expect(res.status).toBe("PENDING");
    expect(res.redirectUrl).toBeDefined();

    const wh = await nagad.webhook({ payment_ref_id: "ngd_ref", status: "SUCCESS" });
    expect(wh.status).toBe("PAID");
  });

  it("Card provider creates payment and verifies", async () => {
    const card = new CardPaymentProvider();
    const res = await card.createPayment({
      orderId: "ord_crd",
      amount: 500000,
      currency: "BDT",
      customerEmail: "user@example.com",
      customerPhone: "01711111111",
      description: "Order ord_crd",
      returnUrl: "http://localhost/checkout/confirm"
    });
    expect(res.status).toBe("PENDING");
    expect(res.redirectUrl).toBeDefined();

    const wh = await card.webhook({ reference: "crd_ref", status: "SUCCEEDED" });
    expect(wh.status).toBe("PAID");
  });
});
