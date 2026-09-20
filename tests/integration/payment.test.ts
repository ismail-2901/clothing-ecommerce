import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture,
  seedUserFixture
} from "./test-db";

describe("Integration: Payment Persistence & Webhook Updates", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("persists payment record with correct provider and amount", async () => {
    const { customer } = await seedUserFixture(db);

    const order = await db.order.create({
      data: {
        orderNumber: "ATC-PAY-" + Date.now(),
        user: { connect: { id: customer.id } },
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 300000,
        grandTotal: 306000,
        currency: "BDT",
        deliveryAddress: { city: "Dhaka", line1: "Test" },
        payments: {
          create: {
            provider: "SSLCOMMERZ",
            amount: 306000,
            currency: "BDT",
            status: "PENDING",
            providerPaymentId: "TRX-12345"
          }
        }
      },
      include: { payments: true }
    });

    expect(order.payments).toHaveLength(1);
    expect(order.payments[0].provider).toBe("SSLCOMMERZ");
    expect(order.payments[0].amount).toBe(306000);
    expect(order.payments[0].providerPaymentId).toBe("TRX-12345");
  });

  it("updates order paymentStatus when payment succeeds via webhook", async () => {
    const { customer } = await seedUserFixture(db);
    const trxId = "BKASH-TRX-" + Date.now();

    const order = await db.order.create({
      data: {
        orderNumber: "ATC-BKASH-" + Date.now(),
        user: { connect: { id: customer.id } },
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 200000,
        grandTotal: 206000,
        currency: "BDT",
        deliveryAddress: { city: "Dhaka", line1: "Test" },
        payments: {
          create: {
            provider: "BKASH",
            amount: 206000,
            currency: "BDT",
            status: "PENDING",
            providerPaymentId: trxId
          }
        }
      },
      include: { payments: true }
    });

    const payment = order.payments[0];

    // Simulate webhook handling transaction
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          metadata: {
            trxId,
            verifiedAt: new Date().toISOString()
          }
        }
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED"
        }
      });
    });

    const refreshedOrder = await db.order.findUnique({
      where: { id: order.id },
      include: { payments: true }
    });

    expect(refreshedOrder?.paymentStatus).toBe("PAID");
    expect(refreshedOrder?.status).toBe("CONFIRMED");
    expect(refreshedOrder?.payments[0].status).toBe("PAID");
    expect((refreshedOrder?.payments[0].metadata as any)?.trxId).toBe(trxId);
  });

  it("tracks multiple payment attempts across retries without data loss", async () => {
    const { customer } = await seedUserFixture(db);

    const order = await db.order.create({
      data: {
        orderNumber: "ATC-RETRY-" + Date.now(),
        user: { connect: { id: customer.id } },
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 100000,
        grandTotal: 106000,
        currency: "BDT",
        deliveryAddress: { city: "Dhaka", line1: "Test" }
      }
    });

    // Attempt 1: Failed
    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "CARD",
        amount: 106000,
        currency: "BDT",
        status: "FAILED",
        providerPaymentId: "TRX-FAIL-1"
      }
    });

    // Attempt 2: Succeeded
    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "BKASH",
        amount: 106000,
        currency: "BDT",
        status: "PAID",
        providerPaymentId: "TRX-SUCCESS-2"
      }
    });

    const allPayments = await db.payment.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: "asc" }
    });

    expect(allPayments).toHaveLength(2);
    expect(allPayments[0].status).toBe("FAILED");
    expect(allPayments[1].status).toBe("PAID");
  });
});
