import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCouponFixture
} from "./test-db";

describe("Concurrency: Coupon Usage Limit against PostgreSQL", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("strictly enforces usageLimit=1 under 10 concurrent checkout requests", async () => {
    const { singleUseCoupon } = await seedCouponFixture(db);
    // singleUseCoupon has usageLimit = 1, usageCount = 0

    const concurrency = 10;

    const results = await Promise.all(
      Array.from({ length: concurrency }).map(async (_, idx) => {
        try {
          return await db.$transaction(async (tx) => {
            const updated = await tx.$executeRaw`
              UPDATE "Coupon"
              SET "usageCount" = "usageCount" + 1
              WHERE id = ${singleUseCoupon.id}
                AND status = 'ACTIVE'
                AND (
                  "usageLimit" IS NULL
                  OR "usageCount" < "usageLimit"
                )
            `;

            if (updated === 0) {
              throw new Error("COUPON_LIMIT_REACHED");
            }

            return { success: true, idx };
          });
        } catch (err: any) {
          return { success: false, error: err.message, idx };
        }
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Exactly 1 request succeeds
    expect(successful).toHaveLength(1);
    expect(failed).toHaveLength(9);

    // Verify DB integrity: usageCount cannot exceed 1
    const refreshed = await db.coupon.findUnique({
      where: { id: singleUseCoupon.id }
    });
    expect(refreshed?.usageCount).toBe(1);
  });
});
