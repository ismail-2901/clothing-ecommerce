import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";
import { invalidateCatalogCache } from "@/features/catalog/data";
import type { ProductStatus } from "@prisma/client";

const bulkProductStatusSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(100),
  newStatus: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]),
  note: z.string().max(500).optional()
});

export type BulkProductStatusResult = {
  id: string;
  name: string;
  slug: string;
  success: boolean;
  previousStatus?: ProductStatus;
  newStatus?: ProductStatus;
  error?: string;
};

// POST /api/admin/products/bulk-status
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

  const parsed = bulkProductStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { productIds, newStatus, note } = parsed.data;

  const results: BulkProductStatusResult[] = [];

  for (const id of productIds) {
    try {
      const product = await prisma.product.findUnique({
        where: { id, deletedAt: null },
        select: { id: true, name: true, slug: true, status: true }
      });

      if (!product) {
        results.push({
          id,
          name: id,
          slug: "",
          success: false,
          error: "Product not found or already deleted"
        });
        continue;
      }

      if (product.status === newStatus) {
        results.push({
          id,
          name: product.name,
          slug: product.slug,
          success: false,
          error: `Product is already in status "${newStatus}".`
        });
        continue;
      }

      const previousStatus = product.status;

      await prisma.$transaction(async (tx) => {
        // If archiving, we also archive product variants
        if (newStatus === "ARCHIVED") {
          await tx.product.update({
            where: { id },
            data: { status: newStatus, deletedAt: new Date() }
          });
          await tx.productVariant.updateMany({
            where: { productId: id, deletedAt: null },
            data: { deletedAt: new Date() }
          });
        } else {
          await tx.product.update({
            where: { id },
            data: { status: newStatus }
          });
        }

        if (userId) {
          await tx.auditLog.create({
            data: {
              actorId: userId,
              action: "PRODUCT_UPDATED",
              resource: "Product",
              resourceId: id,
              previous: { status: previousStatus },
              next: { status: newStatus, note: note || undefined }
            }
          });
        }
      });

      results.push({
        id,
        name: product.name,
        slug: product.slug,
        success: true,
        previousStatus,
        newStatus
      });
    } catch (err: any) {
      results.push({
        id,
        name: id,
        slug: "",
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
    total: productIds.length,
    succeeded,
    failed,
    results
  });
}

