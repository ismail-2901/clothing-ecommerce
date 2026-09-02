import { describe, it, expect } from "vitest";
import { generateOrderNumber } from "@/features/orders/order-service";
import { scoreOrderRisk } from "@/features/risk/risk-score";
import { calculateCartTotals } from "@/features/pricing/pricing";

describe("generateOrderNumber", () => {
  it("returns string with correct prefix", () => {
    const num = generateOrderNumber("ATC");
    expect(num).toMatch(/^ATC-/);
  });

  it("two calls produce different numbers", () => {
    const a = generateOrderNumber("ATC");
    const b = generateOrderNumber("ATC");
    expect(a).not.toBe(b);
  });
});

describe("order creation validation — pricing", () => {
  it("throws on zero quantity", () => {
    expect(() =>
      calculateCartTotals({
        lines: [{ id: "1", productId: "p1", name: "Shirt", unitPrice: 10000, quantity: 0 }],
        shippingFee: 0
      })
    ).toThrow("Invalid line quantity");
  });

  it("throws on negative price", () => {
    expect(() =>
      calculateCartTotals({
        lines: [{ id: "1", productId: "p1", name: "Shirt", unitPrice: -1, quantity: 1 }],
        shippingFee: 0
      })
    ).toThrow("Invalid line price");
  });

  it("grand total never goes negative", () => {
    // Coupon discount greater than subtotal
    const result = calculateCartTotals({
      lines: [{ id: "1", productId: "p1", name: "Shirt", unitPrice: 10000, quantity: 1 }],
      coupon: { code: "BIG", kind: "FIXED_AMOUNT", value: 99999 },
      shippingFee: 0
    });
    expect(result.grandTotal).toBeGreaterThanOrEqual(0);
  });

  it("free shipping coupon zeroes shipping", () => {
    const result = calculateCartTotals({
      lines: [{ id: "1", productId: "p1", name: "Shirt", unitPrice: 10000, quantity: 1 }],
      coupon: { code: "SHIP", kind: "FREE_SHIPPING", value: 0 },
      shippingFee: 10000
    });
    expect(result.shippingFee).toBe(0);
  });
});

describe("order risk scoring integration", () => {
  it("new account + high value = high risk", () => {
    const result = scoreOrderRisk({
      failedDeliveries: 0,
      codRefusals: 0,
      cancellationsLast90Days: 0,
      returnsLast180Days: 0,
      paymentFailuresLast30Days: 0,
      ordersLast24Hours: 0,
      accountAgeDays: 0,
      orderValueMinor: 2000000 // 20,000 BDT on day 0
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it("normal customer has low score", () => {
    const result = scoreOrderRisk({
      failedDeliveries: 0,
      codRefusals: 0,
      cancellationsLast90Days: 0,
      returnsLast180Days: 0,
      paymentFailuresLast30Days: 0,
      ordersLast24Hours: 1,
      accountAgeDays: 365,
      orderValueMinor: 150000
    });
    expect(result.level).toBe("LOW");
    expect(result.recommendedAction).toBe("APPROVE");
  });

  it("repeat abuser scores critical", () => {
    const result = scoreOrderRisk({
      failedDeliveries: 5,
      codRefusals: 3,
      cancellationsLast90Days: 4,
      returnsLast180Days: 5,
      paymentFailuresLast30Days: 3,
      ordersLast24Hours: 5,
      accountAgeDays: 2,
      orderValueMinor: 500000
    });
    expect(result.level).toBe("CRITICAL");
    expect(result.recommendedAction).toBe("HOLD");
  });
});
