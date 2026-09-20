import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedUserFixture,
  seedCatalogFixture
} from "./test-db";

describe("Integration: Authentication & Session Management", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("persists a user account and creates active session record", async () => {
    const email = `testuser-${Date.now()}@example.com`;
    const user = await db.user.create({
      data: {
        name: "Test User",
        email,
        emailVerified: true
      }
    });

    const sessionToken = "token-" + Date.now();
    const session = await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day
      }
    });

    expect(session.id).toBeDefined();
    expect(session.userId).toBe(user.id);
    expect(session.token).toBe(sessionToken);

    const fetchedUser = await db.user.findUnique({
      where: { id: user.id },
      include: { sessions: true }
    });
    expect(fetchedUser?.sessions).toHaveLength(1);
    expect(fetchedUser?.sessions[0].token).toBe(sessionToken);
  });

  it("merges anonymous cart to user cart upon authentication", async () => {
    const { variant } = await seedCatalogFixture(db);
    const { customer } = await seedUserFixture(db);
    const anonId = "anon-" + Date.now();

    // 1. User created a cart while browsing anonymously
    const anonCart = await db.cart.create({
      data: {
        anonymousId: anonId,
        status: "ACTIVE",
        items: {
          create: {
            variantId: variant.id,
            quantity: 3
          }
        }
      },
      include: { items: true }
    });

    // 2. User signs in -> transfer/claim anonymous cart
    await db.cart.update({
      where: { id: anonCart.id },
      data: {
        userId: customer.id,
        anonymousId: null
      }
    });

    // 3. Verify user now owns the cart and anonymous access is cleared
    const userCart = await db.cart.findFirst({
      where: { userId: customer.id, status: "ACTIVE" },
      include: { items: true }
    });

    expect(userCart?.id).toBe(anonCart.id);
    expect(userCart?.userId).toBe(customer.id);
    expect(userCart?.anonymousId).toBeNull();
    expect(userCart?.items[0].quantity).toBe(3);
  });
});
