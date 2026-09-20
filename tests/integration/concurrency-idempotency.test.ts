import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture,
  seedUserFixture
} from "./test-db";

describe("Concurrency: Order Placement Idempotency & Deduplication", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("exposes lack of idempotency: multiple identical rapid requests create duplicate orders", async () => {
    const { product, variant } = await seedCatalogFixture(db);
    const { customer } = await seedUserFixture(db);

    // Initial stock is 10
    const payload = {
      email: customer.email,
      phone: "+8801700000000",
      variantId: variant.id,
      quantity: 1
    };

    // Simulate 3 concurrent/duplicate clicks without server-side idempotency lock
    const createdOrders = await Promise.all(
      [1, 2, 3].map(async (i) => {
        return await db.order.create({
          data: {
            orderNumber: `DUP-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            user: { connect: { id: customer.id } },
            status: "PENDING",
            paymentStatus: "PENDING",
            subtotal: 250000,
            grandTotal: 256000,
            currency: "BDT",
            deliveryAddress: { city: "Dhaka", line1: "House 1" }
          }
        });
      })
    );

    expect(createdOrders).toHaveLength(3);
    const orderNumbers = new Set(createdOrders.map((o) => o.orderNumber));
    expect(orderNumbers.size).toBe(3); // 3 separate orders created!

    // Verify user now has 3 pending orders instead of 1 deduplicated order
    const userOrders = await db.order.findMany({
      where: { userId: customer.id }
    });
    expect(userOrders).toHaveLength(3);
  });

  it("demonstrates safe pattern: idempotency key deduplication prevents multiple charges/orders", async () => {
    const { customer } = await seedUserFixture(db);
    const idempotencyKey = "client-req-uuid-98765";

    // Simulate idempotency handling map or table
    const processedMap = new Map<string, string>();

    async function placeOrderWithIdempotency(key: string) {
      if (processedMap.has(key)) {
        const existingOrderId = processedMap.get(key)!;
        return { isDuplicate: true, orderId: existingOrderId };
      }

      const order = await db.order.create({
        data: {
          orderNumber: `IDEM-${Date.now()}`,
          user: { connect: { id: customer.id } },
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: 250000,
          grandTotal: 256000,
          currency: "BDT",
          deliveryAddress: { city: "Dhaka", line1: "House 1" }
        }
      });

      processedMap.set(key, order.id);
      return { isDuplicate: false, orderId: order.id };
    }

    // Two rapid calls with identical idempotencyKey
    const firstCall = await placeOrderWithIdempotency(idempotencyKey);
    const secondCall = await placeOrderWithIdempotency(idempotencyKey);

    expect(firstCall.isDuplicate).toBe(false);
    expect(secondCall.isDuplicate).toBe(true);
    expect(secondCall.orderId).toBe(firstCall.orderId);

    // Only 1 order exists in database
    const allOrders = await db.order.findMany({
      where: { userId: customer.id }
    });
    expect(allOrders).toHaveLength(1);
  });
});
