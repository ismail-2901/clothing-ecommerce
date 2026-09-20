import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture,
  seedUserFixture
} from "./test-db";

describe("Integration: Order Lifecycle & State", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("creates an order atomically, reserves inventory, and records payment", async () => {
    const { product, variant } = await seedCatalogFixture(db);
    const { customer } = await seedUserFixture(db);

    const orderNumber = "ATC-ORD-" + Date.now();
    const quantity = 2;
    const unitPrice = variant.priceOverride ?? product.basePrice; // 250000
    const subtotal = unitPrice * quantity; // 500000
    const shippingFee = 6000; // 60 BDT
    const grandTotal = subtotal + shippingFee; // 506000

    const order = await db.$transaction(async (tx) => {
      // 1. Atomic conditional stock reservation
      const affected = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedQuantity" = "reservedQuantity" + ${quantity}
        WHERE id = ${variant.id}
          AND "isAvailable" = true
          AND "deletedAt" IS NULL
          AND ("stockQuantity" - "reservedQuantity") >= ${quantity}
      `;
      expect(affected).toBe(1);

      // 2. Inventory movement audit record
      await tx.inventoryMovement.create({
        data: {
          variantId: variant.id,
          actorId: customer.id,
          type: "RESERVATION",
          quantity,
          reason: "Order checkout reservation"
        }
      });

      // 3. Order record
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          user: { connect: { id: customer.id } },
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal,
          discountTotal: 0,
          shippingTotal: shippingFee,
          grandTotal,
          currency: "BDT",
          deliveryAddress: {
            name: "Customer User",
            line1: "House 10, Road 5",
            city: "Dhaka",
            country: "BD"
          },
          items: {
            create: {
              productId: product.id,
              variantId: variant.id,
              sku: variant.sku,
              name: product.name,
              color: variant.color,
              size: variant.size,
              unitPrice,
              quantity,
              lineTotal: subtotal,
              productSnapshot: {
                name: product.name,
                sku: variant.sku,
                price: unitPrice
              }
            }
          },
          payments: {
            create: {
              provider: "COD",
              amount: grandTotal,
              currency: "BDT",
              status: "PENDING"
            }
          },
          history: {
            create: {
              previousStatus: null,
              newStatus: "PENDING",
              actorId: customer.id,
              note: "Order placed"
            }
          }
        },
        include: {
          items: true,
          payments: true,
          history: true
        }
      });

      return newOrder;
    });

    expect(order.id).toBeDefined();
    expect(order.orderNumber).toBe(orderNumber);
    expect(order.status).toBe("PENDING");
    expect(order.paymentStatus).toBe("PENDING");
    expect(order.items).toHaveLength(1);
    expect(order.payments).toHaveLength(1);
    expect(order.payments[0].amount).toBe(506000);
    expect(order.history).toHaveLength(1);

    // Verify inventory reservation in database
    const updatedVariant = await db.productVariant.findUnique({
      where: { id: variant.id }
    });
    expect(updatedVariant?.reservedQuantity).toBe(2);

    // Verify movement log in database
    const movements = await db.inventoryMovement.findMany({
      where: { variantId: variant.id }
    });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("RESERVATION");
    expect(movements[0].quantity).toBe(2);
  });

  it("assigns guestToken and stores guest contact details for unauthenticated guest orders", async () => {
    const { product, variant } = await seedCatalogFixture(db);
    const guestToken = "opaque-random-token-" + Date.now();
    const guestEmail = "guest@example.com";
    const guestPhone = "+8801700000000";

    const order = await db.order.create({
      data: {
        orderNumber: "ATC-GST-" + Date.now(),
        userId: null,
        guestEmail,
        guestPhone,
        guestToken,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: 250000,
        discountTotal: 0,
        shippingTotal: 6000,
        grandTotal: 256000,
        currency: "BDT",
        deliveryAddress: {
          name: "Guest Shopper",
          line1: "Banani 11",
          city: "Dhaka",
          country: "BD"
        }
      }
    });

    expect(order.userId).toBeNull();
    expect(order.guestEmail).toBe(guestEmail);
    expect(order.guestToken).toBe(guestToken);
  });
});
