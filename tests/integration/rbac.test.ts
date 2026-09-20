import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { ensureTestDatabase, cleanupDatabase } from "./test-db";
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

// Import actual production route handlers
import { GET as getAdminProducts, POST as postAdminProducts } from "@/app/api/admin/products/route";
import { PATCH as patchOrderStatus } from "@/app/api/admin/orders/[id]/status/route";
import { GET as getSalesAnalytics } from "@/app/api/admin/analytics/sales/route";
import { POST as postWishlist, DELETE as deleteWishlist } from "@/app/api/wishlist/route";

describe("Real 401/403 Security Matrix: Protected Route Enforcements", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
    currentHeaders = new Headers();
  });

  describe("Endpoint: GET /api/admin/products", () => {
    it("returns 401 for unauthenticated request", async () => {
      currentHeaders = new Headers();
      const req = new NextRequest("http://localhost:3000/api/admin/products");
      const res = await getAdminProducts(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("returns 403 for CUSTOMER role", async () => {
      const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });
      currentHeaders = customer.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        headers: customer.headers
      });
      const res = await getAdminProducts(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Forbidden");
    });

    it("returns 200 for ADMIN role", async () => {
      const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
      currentHeaders = admin.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        headers: admin.headers
      });
      const res = await getAdminProducts(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.products).toBeDefined();
    });

    it("returns 200 for SUPER_ADMIN role", async () => {
      const superAdmin = await createAuthenticatedUser(db, { role: "SUPER_ADMIN" });
      currentHeaders = superAdmin.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        headers: superAdmin.headers
      });
      const res = await getAdminProducts(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.products).toBeDefined();
    });
  });

  describe("Endpoint: POST /api/admin/products", () => {
    it("returns 401 for unauthenticated request", async () => {
      currentHeaders = new Headers();
      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify({})
      });
      const res = await postAdminProducts(req);
      expect(res.status).toBe(401);
    });

    it("returns 403 for CUSTOMER role", async () => {
      const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });
      currentHeaders = customer.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        headers: customer.headers,
        body: JSON.stringify({})
      });
      const res = await postAdminProducts(req);
      expect(res.status).toBe(403);
    });

    it("allows ADMIN and proceeds to validation (returns 422 on empty body)", async () => {
      const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
      currentHeaders = admin.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        headers: admin.headers,
        body: JSON.stringify({})
      });
      const res = await postAdminProducts(req);
      // Validates auth passed, rejected by schema validation
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });
  });

  describe("Endpoint: PATCH /api/admin/orders/[id]/status", () => {
    it("returns 401 for unauthenticated request", async () => {
      currentHeaders = new Headers();
      const req = new NextRequest("http://localhost:3000/api/admin/orders/fake-id/status", {
        method: "PATCH",
        body: JSON.stringify({ newStatus: "CONFIRMED" })
      });
      const res = await patchOrderStatus(req, {
        params: Promise.resolve({ id: "fake-id" })
      });
      expect(res.status).toBe(401);
    });

    it("returns 403 for CUSTOMER role", async () => {
      const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });
      currentHeaders = customer.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/orders/fake-id/status", {
        method: "PATCH",
        headers: customer.headers,
        body: JSON.stringify({ newStatus: "CONFIRMED" })
      });
      const res = await patchOrderStatus(req, {
        params: Promise.resolve({ id: "fake-id" })
      });
      expect(res.status).toBe(403);
    });

    it("allows ADMIN and proceeds to order lookup (returns 404 for non-existent order)", async () => {
      const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
      currentHeaders = admin.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/orders/non-existent-order/status", {
        method: "PATCH",
        headers: admin.headers,
        body: JSON.stringify({ newStatus: "CONFIRMED" })
      });
      const res = await patchOrderStatus(req, {
        params: Promise.resolve({ id: "non-existent-order" })
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Order not found");
    });
  });

  describe("Endpoint: GET /api/admin/analytics/sales", () => {
    it("returns 401 for unauthenticated request", async () => {
      currentHeaders = new Headers();
      const req = new NextRequest("http://localhost:3000/api/admin/analytics/sales");
      const res = await getSalesAnalytics(req);
      expect(res.status).toBe(401);
    });

    it("returns 403 for CUSTOMER role", async () => {
      const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });
      currentHeaders = customer.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/analytics/sales", {
        headers: customer.headers
      });
      const res = await getSalesAnalytics(req);
      expect(res.status).toBe(403);
    });

    it("returns 200 for ADMIN role", async () => {
      const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
      currentHeaders = admin.headers;

      const req = new NextRequest("http://localhost:3000/api/admin/analytics/sales", {
        headers: admin.headers
      });
      const res = await getSalesAnalytics(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.points).toBeDefined();
    });
  });

  describe("Endpoint: Wishlist Session Authentication", () => {
    it("returns 401 on POST /api/wishlist when unauthenticated", async () => {
      currentHeaders = new Headers();
      const req = new NextRequest("http://localhost:3000/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: "prod-123" })
      });
      const res = await postWishlist(req);
      expect(res.status).toBe(401);
    });

    it("returns 401 on DELETE /api/wishlist when unauthenticated", async () => {
      currentHeaders = new Headers();
      const req = new NextRequest("http://localhost:3000/api/wishlist", {
        method: "DELETE",
        body: JSON.stringify({ productId: "prod-123" })
      });
      const res = await deleteWishlist(req);
      expect(res.status).toBe(401);
    });

    it("allows authenticated CUSTOMER to add to wishlist and persists in DB", async () => {
      const customer = await createAuthenticatedUser(db, { role: "CUSTOMER" });
      currentHeaders = customer.headers;

      // Create a category and product
      const cat = await db.category.create({
        data: { name: "Test Cat", slug: "test-cat-" + Date.now() }
      });
      const prod = await db.product.create({
        data: {
          name: "Test Shirt",
          slug: "test-shirt-" + Date.now(),
          description: "Test desc",
          basePrice: 150000,
          categoryId: cat.id,
          status: "PUBLISHED"
        }
      });

      const req = new NextRequest("http://localhost:3000/api/wishlist", {
        method: "POST",
        headers: customer.headers,
        body: JSON.stringify({ productId: prod.id })
      });
      const res = await postWishlist(req);
      expect(res.status).toBe(200);

      // Verify database state
      const userWishlist = await db.wishlist.findUnique({
        where: { userId: customer.user.id },
        include: { items: true }
      });
      expect(userWishlist).not.toBeNull();
      expect(userWishlist?.items.some((i) => i.productId === prod.id)).toBe(true);
    });
  });
});
