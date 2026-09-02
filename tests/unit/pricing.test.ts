import { describe, expect, it } from "vitest";
import { calculateCartTotals, PricingError } from "@/features/pricing/pricing";

describe("calculateCartTotals", () => {
  it("calculates subtotal, percentage coupon, shipping, and grand total", () => {
    const result = calculateCartTotals({
      lines: [
        {
          id: "line_1",
          productId: "prod_1",
          categoryId: "cat_1",
          name: "Black shirt",
          unitPrice: 200000,
          quantity: 2
        }
      ],
      shippingFee: 8000,
      coupon: {
        code: "SAVE10",
        kind: "PERCENTAGE",
        value: 10
      },
      now: new Date("2026-09-01T00:00:00Z")
    });

    expect(result).toEqual({
      subtotal: 400000,
      itemDiscount: 0,
      couponDiscount: 40000,
      shippingFee: 8000,
      grandTotal: 368000,
      appliedCouponCode: "SAVE10"
    });
  });

  it("rejects expired coupons", () => {
    expect(() =>
      calculateCartTotals({
        lines: [
          {
            id: "line_1",
            productId: "prod_1",
            name: "Black shirt",
            unitPrice: 200000,
            quantity: 1
          }
        ],
        shippingFee: 0,
        coupon: {
          code: "OLD",
          kind: "FIXED_AMOUNT",
          value: 1000,
          endsAt: new Date("2026-08-01T00:00:00Z")
        },
        now: new Date("2026-09-01T00:00:00Z")
      })
    ).toThrow(PricingError);
  });
});

