import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCouponFixture
} from "./test-db";
import { calculateCartTotals } from "@/features/pricing/pricing";

describe("Integration: Coupon Validation & Usage", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("applies a valid percentage coupon and computes correct discount", async () => {
    const { activePercentCoupon } = await seedCouponFixture(db);

    const pricing = calculateCartTotals({
      lines: [
        {
          id: "line-1",
          productId: "prod-1",
          name: "Item",
          unitPrice: 200000, // 2000 BDT
          quantity: 1
        }
      ],
      shippingFee: 6000,
      coupon: {
        code: activePercentCoupon.code,
        kind: "PERCENTAGE",
        value: activePercentCoupon.value,
        minSubtotal: activePercentCoupon.minSubtotal ?? undefined
      }
    });

    expect(pricing.subtotal).toBe(200000);
    expect(pricing.couponDiscount).toBe(20000); // 10% of 200000 = 20000
    expect(pricing.grandTotal).toBe(200000 + 6000 - 20000);
    expect(pricing.appliedCouponCode).toBe("SAVE10");
  });

  it("rejects an expired coupon in pricing engine", async () => {
    const { expiredCoupon } = await seedCouponFixture(db);

    expect(() => {
      calculateCartTotals({
        lines: [
          {
            id: "line-1",
            productId: "prod-1",
            name: "Item",
            unitPrice: 200000,
            quantity: 1
          }
        ],
        shippingFee: 6000,
        coupon: {
          code: expiredCoupon.code,
          kind: "PERCENTAGE",
          value: expiredCoupon.value,
          endsAt: expiredCoupon.endsAt ?? undefined
        }
      });
    }).toThrow("Coupon has expired.");
  });

  it("rejects coupon when cart subtotal is below minSubtotal spend", async () => {
    const { activePercentCoupon } = await seedCouponFixture(db);

    // activePercentCoupon has minSubtotal = 100000 (1000 BDT)
    expect(() => {
      calculateCartTotals({
        lines: [
          {
            id: "line-1",
            productId: "prod-1",
            name: "Item",
            unitPrice: 50000, // 500 BDT (< 1000 BDT)
            quantity: 1
          }
        ],
        shippingFee: 6000,
        coupon: {
          code: activePercentCoupon.code,
          kind: "PERCENTAGE",
          value: activePercentCoupon.value,
          minSubtotal: activePercentCoupon.minSubtotal ?? undefined
        }
      });
    }).toThrow("Cart does not meet the coupon minimum spend.");
  });

  it("atomically increments usage count and rejects usage when limit is reached", async () => {
    const { singleUseCoupon } = await seedCouponFixture(db);

    // Usage 1: should succeed
    const updated1 = await db.$executeRaw`
      UPDATE "Coupon"
      SET "usageCount" = "usageCount" + 1
      WHERE id = ${singleUseCoupon.id}
        AND status = 'ACTIVE'
        AND ("usageLimit" IS NULL OR "usageCount" < "usageLimit")
    `;
    expect(updated1).toBe(1);

    // Usage 2: limit is 1, usageCount is now 1, so this MUST affect 0 rows
    const updated2 = await db.$executeRaw`
      UPDATE "Coupon"
      SET "usageCount" = "usageCount" + 1
      WHERE id = ${singleUseCoupon.id}
        AND status = 'ACTIVE'
        AND ("usageLimit" IS NULL OR "usageCount" < "usageLimit")
    `;
    expect(updated2).toBe(0);

    const refreshed = await db.coupon.findUnique({
      where: { id: singleUseCoupon.id }
    });
    expect(refreshed?.usageCount).toBe(1);
  });
});
