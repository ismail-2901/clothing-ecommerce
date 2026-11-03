import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";
import { invalidateCatalogCache } from "@/features/catalog/data";

const updateStockSchema = z.object({
  variantId: z.string().min(1),
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
  expectedCurrentStock: z.number().int().optional()
});

// GET /api/admin/inventory — paginated inventory list
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession("product:manage");
  if (!auth.ok) return auth.response;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 30)));
  const skip = (page - 1) * limit;
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status"); // "in" | "low" | "out"

  const where: Record<string, unknown> = {
    deletedAt: null,
    product: { deletedAt: null }
  };

  if (q) {
    where.OR = [
      { sku: { contains: q, mode: "insensitive" } },
      { color: { contains: q, mode: "insensitive" } },
      { size: { contains: q, mode: "insensitive" } },
      { product: { name: { contains: q, mode: "insensitive" } } }
    ];
  }

  const lowStockThreshold = 5;
  if (status === "low") {
    where.stockQuantity = { gt: 0, lte: lowStockThreshold };
  } else if (status === "out") {
    where.stockQuantity = { lte: 0 };
  } else if (status === "in") {
    where.stockQuantity = { gt: lowStockThreshold };
  }

  const [dbVariants, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      skip,
      take: limit,
      include: {
        product: {
          select: { id: true, name: true, slug: true, basePrice: true, status: true, images: { take: 1, orderBy: { position: "asc" } } }
        }
      },
      orderBy: [{ product: { name: "asc" } }, { color: "asc" }, { size: "asc" }]
    }),
    prisma.productVariant.count({ where })
  ]);

  const variants = dbVariants.map((v) => ({
    id: v.id,
    productId: v.product.id,
    productName: v.product.name,
    productSlug: v.product.slug,
    productStatus: v.product.status,
    productImage: v.product.images[0]?.url || "/elaris-women.jpg",
    sku: v.sku,
    color: v.color,
    size: v.size,
    stockQuantity: v.stockQuantity,
    reservedQuantity: v.reservedQuantity,
    availableQuantity: Math.max(0, v.stockQuantity - v.reservedQuantity),
    price: v.priceOverride ?? v.product.basePrice,
    isAvailable: v.isAvailable
  }));

  return NextResponse.json({
    variants,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
}

// PATCH /api/admin/inventory — single variant inline stock update
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminSession("product:manage");
  if (!auth.ok) return auth.response;
  const { userId } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateStockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { variantId, stockQuantity, expectedCurrentStock } = parsed.data;

  try {
    const existing = await prisma.productVariant.findUnique({
      where: { id: variantId, deletedAt: null },
      include: { product: { select: { name: true, slug: true } } }
    });

    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Invariant check: cannot set stock below currently reserved stock
    if (stockQuantity < existing.reservedQuantity) {
      return NextResponse.json(
        {
          error: `Stock quantity cannot be less than reserved quantity (${existing.reservedQuantity} active reserved units).`
        },
        { status: 422 }
      );
    }

    // Concurrency check: if expectedCurrentStock is provided, check if concurrent update happened
    if (
      expectedCurrentStock !== undefined &&
      existing.stockQuantity !== expectedCurrentStock
    ) {
      return NextResponse.json(
        {
          error: `Conflict: Stock quantity was modified concurrently. Current stock is ${existing.stockQuantity}.`,
          currentStock: existing.stockQuantity,
          reservedQuantity: existing.reservedQuantity
        },
        { status: 409 }
      );
    }

    const diff = stockQuantity - existing.stockQuantity;

    // Only update and log if quantity actually changed
    if (diff !== 0) {
      await prisma.$transaction(async (tx) => {
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            stockQuantity,
            isAvailable: stockQuantity > 0
          }
        });

        await tx.inventoryMovement.create({
          data: {
            variantId,
            actorId: userId ?? null,
            type: "ADJUSTMENT",
            quantity: diff,
            reason: "Manual inline inventory adjustment",
            metadata: {
              previousStock: existing.stockQuantity,
              newStock: stockQuantity,
              reservedQuantity: existing.reservedQuantity
            }
          }
        });

        if (userId) {
          await tx.auditLog.create({
            data: {
              actorId: userId,
              action: "INVENTORY_ADJUSTED",
              resource: "ProductVariant",
              resourceId: variantId,
              previous: { stockQuantity: existing.stockQuantity },
              next: { stockQuantity, diff }
            }
          });
        }
      });

      await invalidateCatalogCache();
    }

    const availableQuantity = Math.max(0, stockQuantity - existing.reservedQuantity);

    return NextResponse.json({
      success: true,
      variant: {
        id: existing.id,
        sku: existing.sku,
        stockQuantity,
        reservedQuantity: existing.reservedQuantity,
        availableQuantity,
        isAvailable: stockQuantity > 0
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update stock quantity" },
      { status: 500 }
    );
  }
}

