import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture
} from "./test-db";

describe("Concurrency: Inventory Reservation against PostgreSQL", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("prevents overselling under high concurrency (10 concurrent requests for 2 available units)", async () => {
    const { variant } = await seedCatalogFixture(db);

    // Set stockQuantity to exactly 2
    await db.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: 2, reservedQuantity: 0 }
    });

    const concurrency = 10;
    const requestedUnitsPerOrder = 1;

    // Run 10 parallel reservation transactions against PostgreSQL
    const results = await Promise.all(
      Array.from({ length: concurrency }).map(async (_, idx) => {
        try {
          return await db.$transaction(async (tx) => {
            const affected = await tx.$executeRaw`
              UPDATE "ProductVariant"
              SET "reservedQuantity" = "reservedQuantity" + ${requestedUnitsPerOrder}
              WHERE id = ${variant.id}
                AND "isAvailable" = true
                AND "deletedAt" IS NULL
                AND ("stockQuantity" - "reservedQuantity") >= ${requestedUnitsPerOrder}
            `;

            if (affected === 0) {
              throw new Error("OUT_OF_STOCK");
            }

            await tx.inventoryMovement.create({
              data: {
                variantId: variant.id,
                type: "RESERVATION",
                quantity: requestedUnitsPerOrder,
                reason: `Concurrent reservation test #${idx}`
              }
            });

            return { success: true, idx };
          });
        } catch (err: any) {
          return { success: false, error: err.message, idx };
        }
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Exactly 2 requests must succeed and exactly 8 must fail
    expect(successful).toHaveLength(2);
    expect(failed).toHaveLength(8);

    // Verify DB integrity: reservedQuantity must be exactly 2
    const refreshedVariant = await db.productVariant.findUnique({
      where: { id: variant.id }
    });
    expect(refreshedVariant?.reservedQuantity).toBe(2);
    expect(refreshedVariant?.stockQuantity).toBe(2);

    // Verify audit logs: exactly 2 movement records
    const movements = await db.inventoryMovement.findMany({
      where: { variantId: variant.id }
    });
    expect(movements).toHaveLength(2);
  });
});
