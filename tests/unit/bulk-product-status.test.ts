import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/auth/server", () => ({
  requireAdminSession: vi.fn().mockResolvedValue({ ok: true, userId: "admin-1" })
}));

vi.mock("@/features/catalog/data", () => ({
  invalidateCatalogCache: vi.fn().mockResolvedValue(undefined)
}));

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateMany = vi.fn();
const mockAuditCreate = vi.fn();
const mockTransaction = vi.fn(async (cb: any) => {
  return cb({
    product: { update: mockUpdate },
    productVariant: { updateMany: mockUpdateMany },
    auditLog: { create: mockAuditCreate }
  });
});

vi.mock("@/db/prisma", () => ({
  prisma: {
    product: {
      findUnique: (...args: any[]) => mockFindUnique(...args)
    },
    $transaction: (cb: any) => mockTransaction(cb)
  }
}));

import { POST } from "@/app/api/admin/products/bulk-status/route";
import { NextRequest } from "next/server";

describe("Bulk Product Status Update (POST /api/admin/products/bulk-status)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully updates products to PUBLISHED and creates audit logs", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "prod-1",
      name: "Silk Shirt",
      slug: "silk-shirt",
      status: "DRAFT"
    });

    const req = new NextRequest("http://localhost:3000/api/admin/products/bulk-status", {
      method: "POST",
      body: JSON.stringify({
        productIds: ["prod-1"],
        newStatus: "PUBLISHED",
        note: "Catalog launch"
      })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.succeeded).toBe(1);
    expect(body.failed).toBe(0);
    expect(body.results[0].success).toBe(true);
    expect(body.results[0].newStatus).toBe("PUBLISHED");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "prod-1" },
      data: { status: "PUBLISHED" }
    });
    expect(mockAuditCreate).toHaveBeenCalled();
  });

  it("skips products that are already in the requested status", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "prod-1",
      name: "Silk Shirt",
      slug: "silk-shirt",
      status: "PUBLISHED"
    });

    const req = new NextRequest("http://localhost:3000/api/admin/products/bulk-status", {
      method: "POST",
      body: JSON.stringify({
        productIds: ["prod-1"],
        newStatus: "PUBLISHED"
      })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.succeeded).toBe(0);
    expect(body.failed).toBe(1);
    expect(body.results[0].error).toContain("already in status");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("handles non-existent products gracefully with partial failure reporting", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/admin/products/bulk-status", {
      method: "POST",
      body: JSON.stringify({
        productIds: ["prod-missing"],
        newStatus: "ARCHIVED"
      })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.succeeded).toBe(0);
    expect(body.failed).toBe(1);
    expect(body.results[0].error).toContain("Product not found");
  });

  it("returns 422 if invalid status or empty productIds passed", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/products/bulk-status", {
      method: "POST",
      body: JSON.stringify({
        productIds: [],
        newStatus: "INVALID_STATUS"
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});

