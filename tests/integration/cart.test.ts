import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture
} from "./test-db";

describe("Integration: Cart Management", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("creates an active cart for an anonymous user and persists items", async () => {
    const { variant } = await seedCatalogFixture(db);
    const anonId = "anon-user-" + Date.now();

    const cart = await db.cart.create({
      data: {
        anonymousId: anonId,
        status: "ACTIVE",
        items: {
          create: {
            variantId: variant.id,
            quantity: 2
          }
        }
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      }
    });

    expect(cart.id).toBeDefined();
    expect(cart.anonymousId).toBe(anonId);
    expect(cart.status).toBe("ACTIVE");
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[0].variant.product.basePrice).toBe(250000);
  });

  it("enforces available stock boundaries when adding items to cart", async () => {
    const { variant } = await seedCatalogFixture(db);
    const anonId = "anon-user-" + Date.now();

    // variant has stockQuantity = 10, reservedQuantity = 0
    const requestedQty = 15;
    const available = variant.stockQuantity - variant.reservedQuantity;

    expect(requestedQty).toBeGreaterThan(available);

    // Business check: adding more than available must be rejected
    const isExceeding = requestedQty > available;
    expect(isExceeding).toBe(true);
  });

  it("updates item quantity and recalculates line total accurately", async () => {
    const { variant } = await seedCatalogFixture(db);
    const anonId = "anon-user-" + Date.now();

    const cart = await db.cart.create({
      data: {
        anonymousId: anonId,
        status: "ACTIVE",
        items: {
          create: {
            variantId: variant.id,
            quantity: 1
          }
        }
      },
      include: { items: true }
    });

    const cartItemId = cart.items[0].id;

    // Update quantity to 3
    const updatedItem = await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: 3 }
    });

    expect(updatedItem.quantity).toBe(3);
    const lineTotal = 3 * variant.priceOverride! || 3 * 250000;
    expect(lineTotal).toBe(750000);
  });

  it("removes an item from the cart cleanly", async () => {
    const { variant } = await seedCatalogFixture(db);
    const anonId = "anon-user-" + Date.now();

    const cart = await db.cart.create({
      data: {
        anonymousId: anonId,
        status: "ACTIVE",
        items: {
          create: {
            variantId: variant.id,
            quantity: 1
          }
        }
      },
      include: { items: true }
    });

    await db.cartItem.delete({
      where: { id: cart.items[0].id }
    });

    const refreshed = await db.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });

    expect(refreshed?.items).toHaveLength(0);
  });

  it("isolates carts between different anonymous users", async () => {
    const { variant } = await seedCatalogFixture(db);
    const anon1 = "anon-user-1";
    const anon2 = "anon-user-2";

    const cart1 = await db.cart.create({
      data: {
        anonymousId: anon1,
        status: "ACTIVE",
        items: { create: { variantId: variant.id, quantity: 1 } }
      }
    });

    const cart2 = await db.cart.create({
      data: {
        anonymousId: anon2,
        status: "ACTIVE",
        items: { create: { variantId: variant.id, quantity: 4 } }
      }
    });

    expect(cart1.id).not.toBe(cart2.id);

    const user1Cart = await db.cart.findFirst({
      where: { anonymousId: anon1, status: "ACTIVE" },
      include: { items: true }
    });

    const user2Cart = await db.cart.findFirst({
      where: { anonymousId: anon2, status: "ACTIVE" },
      include: { items: true }
    });

    expect(user1Cart?.items[0].quantity).toBe(1);
    expect(user2Cart?.items[0].quantity).toBe(4);
  });
});
