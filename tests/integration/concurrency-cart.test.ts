import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { ensureTestDatabase, cleanupDatabase } from "./test-db";

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

import { GET as getCart } from "@/app/api/cart/route";

describe("Concurrency: Cart Creation Race Condition (/api/cart)", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
    currentHeaders = new Headers();
  });

  it("calls actual /api/cart concurrently with the same identity — asserts exactly one ACTIVE cart exists", async () => {
    const anonymousId = "concurrent-anon-" + Date.now();
    const concurrency = 10;

    currentHeaders = new Headers({
      cookie: `cart_anon_id=${anonymousId}`
    });

    // Execute 10 concurrent requests hitting the real /api/cart route handler
    const responses = await Promise.all(
      Array.from({ length: concurrency }).map(async () => {
        const req = new NextRequest("http://localhost:3000/api/cart", {
          headers: new Headers({ cookie: `cart_anon_id=${anonymousId}` })
        });
        return await getCart(req);
      })
    );

    // All requests should return 200 OK
    for (const res of responses) {
      expect(res.status).toBe(200);
    }

    // Inspect database state: count how many ACTIVE carts exist for this identity
    const activeCarts = await db.cart.findMany({
      where: { anonymousId, status: "ACTIVE" }
    });

    // REGRESSION TEST:
    // Before fix: test reproduces duplicate carts (activeCarts.length > 1) due to non-atomic findFirst + create
    // After fix: atomic upsert / partial unique index ensures exactly 1 active cart
    // MUST fail if more than one cart exists
    expect(activeCarts).toHaveLength(1);
  });
});
