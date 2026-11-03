import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";
import { invalidateCatalogCache } from "@/features/catalog/data";

const bulkInventoryItemSchema = z.object({
  variantId: z.string().min(1),
  mode: z.enum(["SET", "ADD"]),
  quantity: z.number().int()
});

const bulkInventorySchema = z.object({
  items: z.array(bulkInventoryItemSchema).min(1).max(100),
  reason: z.string().max(500).optional()
});

export type BulkInventoryResult = {
  variantId: string;
  sku: string;
  success: boolean;
  previousStock?: number;
  newStock?: number;
  reservedQuantity?: number;
  error?: string;
};

// POST /api/admin/inventory/bulk — batch stock adjustment or replenishment
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession("product:manage");
  if (!auth.ok) return auth.response;
  const { userId } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bulkInventorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { items, reason } = parsed.data;
  const results: BulkInventoryResult[] = [];

  for (const item of items) {
    try {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId, deletedAt: null },
        select: { id: true, sku: true, stockQuantity: true, reservedQuantity: true }
      });

      if (!variant) {
        results.push({
          variantId: item.variantId,
          sku: item.variantId,
          success: false,
          error: "Variant not found"
        });
        continue;
      }

      const targetStock =
        item.mode === "SET"
          ? item.quantity
          : variant.stockQuantity + item.quantity;

      if (targetStock < 0) {
        results.push({
          variantId: variant.id,
          sku: variant.sku,
          success: false,
          previousStock: variant.stockQuantity,
          error: `Resulting stock (${targetStock}) cannot be negative`
        });
        continue;
      }

      if (targetStock < variant.reservedQuantity) {
        results.push({
          variantId: variant.id,
          sku: variant.sku,
          success: false,
          previousStock: variant.stockQuantity,
          reservedQuantity: variant.reservedQuantity,
          error: `Resulting stock (${targetStock}) cannot be less than reserved quantity (${variant.reservedQuantity})`
        });
        continue;
      }

      const diff = targetStock - variant.stockQuantity;

      if (diff !== 0) {
        await prisma.$transaction(async (tx) => {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stockQuantity: targetStock,
              isAvailable: targetStock > 0
            }
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              actorId: userId ?? null,
              type: "ADJUSTMENT",
              quantity: diff,
              reason: reason || `Bulk ${item.mode === "ADD" ? "restock replenishment" : "stock adjustment"}`,
              metadata: {
                previousStock: variant.stockQuantity,
                newStock: targetStock,
                reservedQuantity: variant.reservedQuantity,
                mode: item.mode
              }
            }
          });

          if (userId) {
            await tx.auditLog.create({
              data: {
                actorId: userId,
                action: "INVENTORY_ADJUSTED",
                resource: "ProductVariant",
                resourceId: variant.id,
                previous: { stockQuantity: variant.stockQuantity },
                next: { stockQuantity: targetStock, diff }
              }
            });
          }
        });
      }

      results.push({
        variantId: variant.id,
        sku: variant.sku,
        success: true,
        previousStock: variant.stockQuantity,
        newStock: targetStock,
        reservedQuantity: variant.reservedQuantity
      });
    } catch (err: any) {
      results.push({
        variantId: item.variantId,
        sku: item.variantId,
        success: false,
        error: err?.message || "Internal database error"
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  if (succeeded > 0) {
    await invalidateCatalogCache();
  }

  return NextResponse.json({
    total: items.length,
    succeeded,
    failed,
    results
  });
}

