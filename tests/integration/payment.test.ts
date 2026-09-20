import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { ensureTestDatabase, cleanupDatabase } from "./test-db";
import { createAuthenticatedUser } from "./test-auth-helper";
import { POST as handlePaymentWebhook } from "@/app/api/payments/webhook/[provider]/route";

describe("Payment Webhooks: Real Route Handler Verification (POST /api/payments/webhook/:provider)", () => {
  let db: PrismaClient;
  const WEBHOOK_SECRET = "test-secret-webhook-key-42";

  beforeAll(async () => {
    db = await ensureTestDatabase();
    process.env.WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  async function seedOrderAndPayment(provider = "SSLCOMMERZ", amount = 206000, status: "PENDING" | "PAID" = "PENDING") {
    const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });
    const orderId = "ord-" + Math.random().toString(36).slice(2, 9);
    const orderNumber = "ATC-" + Date.now();
    const trxId = "TRX-" + Date.now();

    await db.$executeRawUnsafe(
      `INSERT INTO "Order" (id, "orderNumber", "userId", status, "paymentStatus", subtotal, "discountTotal", "shippingTotal", "taxTotal", "grandTotal", currency, "deliveryAddress", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 0, 6000, 0, $7, 'BDT', '{"city":"Dhaka"}'::jsonb, NOW(), NOW())`,
      orderId,
      orderNumber,
      customer.user.id,
      status === "PAID" ? "CONFIRMED" : "PENDING",
      status,
      amount - 6000,
      amount
    );

    const payment = await db.payment.create({
      data: {
        orderId,
        provider: provider as any,
        amount,
        currency: "BDT",
        status,
        providerPaymentId: trxId
      }
    });

    return { customer, orderId, orderNumber, trxId, payment };
  }

  it("rejects forged webhooks with invalid signature (returns 401)", async () => {
    const { trxId } = await seedOrderAndPayment();

    const req = new NextRequest("http://localhost:3000/api/payments/webhook/sslcommerz", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-secret": "wrong-forged-secret"
      },
      body: JSON.stringify({
        val_id: trxId,
        status: "VALID",
        amount: "2060.00",
        currency: "BDT"
      })
    });

    const res = await handlePaymentWebhook(req, {
      params: Promise.resolve({ provider: "sslcommerz" })
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("processes valid webhook and updates database payment and order status", async () => {
    const { orderId, trxId, payment } = await seedOrderAndPayment();

    const req = new NextRequest("http://localhost:3000/api/payments/webhook/sslcommerz", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-secret": WEBHOOK_SECRET
      },
      body: JSON.stringify({
        val_id: trxId,
        status: "VALID",
        amount: "2060.00",
        currency: "BDT"
      })
    });

    const res = await handlePaymentWebhook(req, {
      params: Promise.resolve({ provider: "sslcommerz" })
    });

    expect(res.status).toBe(200);

    // Verify database state after request
    const updatedPayment = await db.payment.findUnique({
      where: { id: payment.id }
    });
    expect(updatedPayment?.status).toBe("PAID");

    const updatedOrder = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, paymentStatus: true }
    });
    expect(updatedOrder?.paymentStatus).toBe("PAID");
    expect(updatedOrder?.status).toBe("CONFIRMED");
  });

  it("rejects webhooks with wrong payment amount", async () => {
    const { trxId } = await seedOrderAndPayment("SSLCOMMERZ", 206000); // 2060 BDT

    // Attacker sends webhook with tampered amount (100 BDT instead of 2060 BDT)
    const req = new NextRequest("http://localhost:3000/api/payments/webhook/sslcommerz", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-secret": WEBHOOK_SECRET
      },
      body: JSON.stringify({
        val_id: trxId,
        status: "VALID",
        amount: "100.00", // Tampered amount
        currency: "BDT"
      })
    });

    const res = await handlePaymentWebhook(req, {
      params: Promise.resolve({ provider: "sslcommerz" })
    });

    // REGRESSION TEST:
    // Route must reject mismatched amount (HTTP 422 or 400).
    // Before fix (BUG-12): route ignores amount check and returns 200.
    expect(res.status).toBe(422);
  });

  it("rejects webhooks with wrong provider parameter", async () => {
    const { trxId } = await seedOrderAndPayment("SSLCOMMERZ", 206000);

    // Incoming request targeting bkash endpoint for an SSLCOMMERZ payment
    const req = new NextRequest("http://localhost:3000/api/payments/webhook/bkash", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-secret": WEBHOOK_SECRET
      },
      body: JSON.stringify({
        paymentID: trxId,
        transactionStatus: "Completed",
        amount: "2060"
      })
    });

    const res = await handlePaymentWebhook(req, {
      params: Promise.resolve({ provider: "bkash" })
    });

    // REGRESSION TEST:
    // Route must reject provider mismatch.
    // Before fix (BUG-14): route proceeds without verifying payment.provider == providerInstance.code.
    expect(res.status).toBe(422);
  });

  it("handles replayed webhooks safely without duplicating status history side effects", async () => {
    // Payment is ALREADY in PAID status
    const { orderId, trxId } = await seedOrderAndPayment("SSLCOMMERZ", 206000, "PAID");

    const countBefore = await db.orderStatusHistory.count({
      where: { orderId }
    });

    const req = new NextRequest("http://localhost:3000/api/payments/webhook/sslcommerz", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-secret": WEBHOOK_SECRET
      },
      body: JSON.stringify({
        val_id: trxId,
        status: "VALID",
        amount: "2060.00",
        currency: "BDT"
      })
    });

    const res = await handlePaymentWebhook(req, {
      params: Promise.resolve({ provider: "sslcommerz" })
    });

    expect(res.status).toBe(200);

    // REGRESSION TEST:
    // Replayed event on already-PAID order should NOT create redundant OrderStatusHistory records.
    // Before fix (BUG-13): a new OrderStatusHistory row is created on every replay.
    const countAfter = await db.orderStatusHistory.count({
      where: { orderId }
    });
    expect(countAfter).toBe(countBefore);
  });
});
