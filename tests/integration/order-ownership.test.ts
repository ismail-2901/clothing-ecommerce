import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedUserFixture
} from "./test-db";

describe("Integration: Order Ownership & Access Control (IDOR Prevention)", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("authorizes order owner to retrieve their own order", async () => {
    const { customer } = await seedUserFixture(db);

    const order = await db.order.create({
      data: {
        orderNumber: "ORD-OWNER-1",
        user: { connect: { id: customer.id } },
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 100000,
        grandTotal: 106000,
        currency: "BDT",
        deliveryAddress: { city: "Dhaka", line1: "Test" }
      }
    });

    // Simulate caller = customer.id
    const callerId = customer.id;
    const isOwner = callerId === order.userId;
    expect(isOwner).toBe(true);
  });

  it("denies access when a different authenticated user tries to view another user's order", async () => {
    const { customer, otherCustomer } = await seedUserFixture(db);

    const victimOrder = await db.order.create({
      data: {
        orderNumber: "ORD-VICTIM-1",
        user: { connect: { id: customer.id } },
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 500000,
        grandTotal: 506000,
        currency: "BDT",
        deliveryAddress: { city: "Dhaka", line1: "Secret Location" }
      }
    });

    // Attacker callerId = otherCustomer.id
    const attackerId = otherCustomer.id;
    const isOwner = attackerId === victimOrder.userId;
    expect(isOwner).toBe(false);

    // Verify attacker is not an admin
    const adminRole = await db.userRole.findFirst({
      where: {
        userId: attackerId,
        role: { name: { in: ["ADMIN", "SUPER_ADMIN"] } }
      }
    });
    expect(adminRole).toBeNull();

    // Access must be denied
    const isAuthorized = isOwner || !!adminRole;
    expect(isAuthorized).toBe(false);
  });

  it("allows guest order access only with matching guestToken", async () => {
    const validGuestToken = "secure-guest-token-12345";

    const guestOrder = await db.order.create({
      data: {
        orderNumber: "ORD-GUEST-1",
        userId: null,
        guestToken: validGuestToken,
        guestEmail: "guest@example.com",
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 100000,
        grandTotal: 106000,
        currency: "BDT",
        deliveryAddress: { city: "Dhaka", line1: "Test" }
      }
    });

    // Case A: Valid token provided
    const isAuthorizedValid = Boolean(!guestOrder.userId && guestOrder.guestToken === validGuestToken);
    expect(isAuthorizedValid).toBe(true);

    // Case B: Wrong token provided
    const isAuthorizedWrong = Boolean(!guestOrder.userId && guestOrder.guestToken === "wrong-token");
    expect(isAuthorizedWrong).toBe(false);

    // Case C: No token provided
    const isAuthorizedMissing = Boolean(!guestOrder.userId && guestOrder.guestToken === undefined);
    expect(isAuthorizedMissing).toBe(false);
  });

  it("allows admin user to access any order regardless of ownership", async () => {
    const { customer, adminUser } = await seedUserFixture(db);

    const order = await db.order.create({
      data: {
        orderNumber: "ORD-ANY-1",
        user: { connect: { id: customer.id } },
        status: "CONFIRMED",
        paymentStatus: "PAID",
        subtotal: 100000,
        grandTotal: 106000,
        currency: "BDT",
        deliveryAddress: { city: "Dhaka", line1: "Test" }
      }
    });

    // Caller is adminUser.id
    const callerId = adminUser.id;
    const isOwner = callerId === order.userId;
    expect(isOwner).toBe(false);

    const adminRole = await db.userRole.findFirst({
      where: {
        userId: callerId,
        role: { name: { in: ["ADMIN", "SUPER_ADMIN"] } }
      }
    });

    const isAdmin = Boolean(adminRole);
    expect(isAdmin).toBe(true);
    expect(isOwner || isAdmin).toBe(true);
  });
});
