import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/server", () => ({
  requireAdminSession: vi.fn().mockResolvedValue({ ok: true, userId: "admin-1" })
}));

vi.mock("@/features/catalog/data", () => ({
  invalidateCatalogCache: vi.fn().mockResolvedValue(undefined)
}));

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockMovementCreate = vi.fn();
const mockAuditCreate = vi.fn();
const mockTransaction = vi.fn(async (cb: any) => {
  return cb({
    productVariant: { update: mockUpdate },
    inventoryMovement: { create: mockMovementCreate },
    auditLog: { create: mockAuditCreate }
  });
});

vi.mock("@/db/prisma", () => ({
  prisma: {
    productVariant: {
      findUnique: (...args: any[]) => mockFindUnique(...args)
    },
    $transaction: (cb: any) => mockTransaction(cb)
  }
}));

import { PATCH } from "@/app/api/admin/inventory/route";
import { POST as bulkPost } from "@/app/api/admin/inventory/bulk/route";
import { NextRequest } from "next/server";

describe("Inventory Inline & Bulk Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PATCH /api/admin/inventory", () => {
    it("successfully updates stock quantity and logs inventory movement", async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: "var-1",
        sku: "TSH-BLK-M",
        stockQuantity: 10,
        reservedQuantity: 2,
        product: { name: "T-Shirt", slug: "t-shirt" }
      });

      const req = new NextRequest("http://localhost:3000/api/admin/inventory", {
        method: "PATCH",
        body: JSON.stringify({
          variantId: "var-1",
          stockQuantity: 25,
          expectedCurrentStock: 10
        })
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.variant.stockQuantity).toBe(25);
      expect(body.variant.availableQuantity).toBe(23); // 25 - 2
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "var-1" },
        data: { stockQuantity: 25, isAvailable: true }
      });
      expect(mockMovementCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          variantId: "var-1",
          quantity: 15, // +15 diff
          type: "ADJUSTMENT"
        })
      });
    });

    it("rejects stock update when stock is less than reservedQuantity", async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: "var-1",
        sku: "TSH-BLK-M",
        stockQuantity: 10,
        reservedQuantity: 5,
        product: { name: "T-Shirt", slug: "t-shirt" }
      });

      const req = new NextRequest("http://localhost:3000/api/admin/inventory", {
        method: "PATCH",
        body: JSON.stringify({
          variantId: "var-1",
          stockQuantity: 3
        })
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.error).toContain("reserved quantity (5 active reserved units)");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("rejects update on concurrency conflict (409)", async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: "var-1",
        sku: "TSH-BLK-M",
        stockQuantity: 12, // changed by customer purchase in background
        reservedQuantity: 2,
        product: { name: "T-Shirt", slug: "t-shirt" }
      });

      const req = new NextRequest("http://localhost:3000/api/admin/inventory", {
        method: "PATCH",
        body: JSON.stringify({
          variantId: "var-1",
          stockQuantity: 20,
          expectedCurrentStock: 10 // admin thought it was still 10
        })
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.error).toContain("modified concurrently");
      expect(body.currentStock).toBe(12);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/inventory/bulk", () => {
    it("successfully applies batch replenishment with ADD mode", async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: "var-1",
        sku: "TSH-BLK-M",
        stockQuantity: 5,
        reservedQuantity: 1
      });

      const req = new NextRequest("http://localhost:3000/api/admin/inventory/bulk", {
        method: "POST",
        body: JSON.stringify({
          items: [{ variantId: "var-1", mode: "ADD", quantity: 10 }],
          reason: "Warehouse shipment restock"
        })
      });

      const res = await bulkPost(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.succeeded).toBe(1);
      expect(body.results[0].newStock).toBe(15);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "var-1" },
        data: { stockQuantity: 15, isAvailable: true }
      });
    });
  });
});

