import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture
} from "./test-db";
import { createAuthenticatedUser } from "./test-auth-helper";

let currentHeaders = new Headers();

vi.mock("next/headers", () => ({
  headers: async () => currentHeaders,
  cookies: async () => ({
    get: (name: string) => {
      const cookieHeader = currentHeaders.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      return match ? { name, value: match[1] } : undefined;
    }
  })
}));

import { POST as createOrder } from "@/app/api/orders/route";

describe("Concurrency: Order Placement Idempotency & Deduplication (/api/orders)", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
    currentHeaders = new Headers();
  });

  it("sends 10 concurrent HTTP requests with the SAME Idempotency-Key — asserts exactly one order is created", async () => {
    const { variant } = await seedCatalogFixture(db);
    const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });
    const idempotencyKey = "idem-req-uuid-" + Date.now();
    const concurrency = 10;

    const payload = {
      email: customer.user.email,
      phone: "01712345678",
      deliveryAddress: {
        name: "Customer User",
        line1: "House 1, Road 2",
        city: "Dhaka",
        country: "BD"
      },
      paymentProvider: "COD",
      cartItems: [
        {
          variantId: variant.id,
          quantity: 1
        }
      ]
    };

    // Execute 10 concurrent requests to POST /api/orders with the identical Idempotency-Key
    const responses = await Promise.all(
      Array.from({ length: concurrency }).map(async () => {
        const reqHeaders = new Headers(customer.headers);
        reqHeaders.set("Idempotency-Key", idempotencyKey);
        reqHeaders.set("Content-Type", "application/json");

        currentHeaders = reqHeaders;

        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify(payload)
        });

        return await createOrder(req);
      })
    );

    // Query database state for the customer's orders
    const orders = await db.order.findMany({
      where: { userId: customer.user.id }
    });

    const inventoryMovements = await db.inventoryMovement.findMany({
      where: { variantId: variant.id, type: "RESERVATION" }
    });

    const payments = await db.payment.findMany({
      where: { orderId: { in: orders.map((o) => o.id) } }
    });

    // REGRESSION TEST:
    // With persistent idempotency mechanism:
    // - exactly one order
    // - exactly one inventory reservation
    // - exactly one logical payment
    // - all duplicate requests return the same result
    expect(orders).toHaveLength(1);
    expect(inventoryMovements).toHaveLength(1);
    expect(payments).toHaveLength(1);
  });
});
