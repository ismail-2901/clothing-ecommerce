import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { ensureTestDatabase, cleanupDatabase, seedCatalogFixture } from "./test-db";
import { createAuthenticatedUser } from "./test-auth-helper";

let currentHeaders = new Headers();
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => currentHeaders),
  cookies: vi.fn(async () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {}
  }))
}));

import { POST as createOrder } from "@/app/api/orders/route";

describe("COD-Only Policy Enforcement (/api/orders)", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
    currentHeaders = new Headers();
  });

  it("strictly rejects checkout with BKASH payment method (HTTP 422)", async () => {
    const { variant } = await seedCatalogFixture(db);
    const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });

    const payload = {
      email: customer.user.email,
      phone: "01712345678",
      deliveryAddress: {
        name: "Customer User",
        line1: "House 1, Road 2",
        city: "Dhaka",
        country: "BD"
      },
      paymentProvider: "BKASH",
      cartItems: [{ variantId: variant.id, quantity: 1 }]
    };

    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const res = await createOrder(req);
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toBe("Validation failed");
    const issue = data.issues?.find((i: any) => i.path?.includes("paymentProvider"));
    expect(issue).toBeDefined();

    // Verify zero orders created in database
    const orderCount = await db.order.count();
    expect(orderCount).toBe(0);
  });

  it("strictly rejects checkout with SSLCOMMERZ payment method (HTTP 422)", async () => {
    const { variant } = await seedCatalogFixture(db);
    const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });

    const payload = {
      email: customer.user.email,
      phone: "01712345678",
      deliveryAddress: {
        name: "Customer User",
        line1: "House 1, Road 2",
        city: "Dhaka",
        country: "BD"
      },
      paymentProvider: "SSLCOMMERZ",
      cartItems: [{ variantId: variant.id, quantity: 1 }]
    };

    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const res = await createOrder(req);
    expect(res.status).toBe(422);

    // Verify zero orders created in database
    const orderCount = await db.order.count();
    expect(orderCount).toBe(0);
  });

  it("accepts COD payment method and sets order & payment status to PENDING (unpaid upon creation)", async () => {
    const { variant } = await seedCatalogFixture(db);
    const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });

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
      cartItems: [{ variantId: variant.id, quantity: 1 }]
    };

    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const res = await createOrder(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.orderNumber).toBeDefined();

    // Query database directly to verify persisted statuses
    const createdOrder = await db.order.findUnique({
      where: { orderNumber: data.orderNumber },
      include: { payments: true }
    });

    expect(createdOrder).not.toBeNull();
    // Order must be PENDING (unfulfilled)
    expect(createdOrder?.status).toBe("PENDING");
    // Payment must be PENDING (unpaid until delivery)
    expect(createdOrder?.paymentStatus).toBe("PENDING");

    // Payment record must exist with provider COD and status PENDING
    expect(createdOrder?.payments.length).toBeGreaterThan(0);
    const payment = createdOrder?.payments[0];
    expect(payment?.provider).toBe("COD");
    expect(payment?.status).toBe("PENDING");
  });
});
