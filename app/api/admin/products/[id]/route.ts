import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { isValidAdminSession } from "@/lib/auth/admin-auth";

async function requireAdmin(request: NextRequest) {
  const adminCookie = request.cookies.get("admin_session")?.value;
  if (isValidAdminSession(adminCookie)) {
    return { error: null, userId: null };
  }

  const session = await getServerSession();
  if (!session?.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null };
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.userId },
    include: { role: true }
  });

  const isAdmin = userRoles.some(
    (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
  );

  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), userId: null };
  }

  return { error: null, userId: session.userId };
}

type RouteParams = { params: Promise<{ id: string }> };

const variantSchema = z.object({
  sku: z.string().min(1).max(100),
  color: z.string().min(1).max(50),
  size: z.string().min(1).max(20),
  priceOverride: z.number().int().min(0).optional(),
  stockQuantity: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
});

const putProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  basePrice: z.number().int().min(1),
  salePrice: z.number().int().min(0).nullable().optional(),
  material: z.string().max(500).nullable().optional(),
  careInstructions: z.string().max(500).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().min(1)).default([]),
  variants: z.array(variantSchema).min(1),
});

const patchProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  basePrice: z.number().int().min(1).optional(),
  salePrice: z.number().int().min(0).nullable().optional(),
  material: z.string().max(500).nullable().optional(),
  careInstructions: z.string().max(500).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
});

// GET /api/admin/products/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      collection: true,
      variants: { where: { deletedAt: null }, orderBy: [{ color: "asc" }, { size: "asc" }] },
      images: { orderBy: { position: "asc" } },
      tags: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/admin/products/[id] — full replace (used by edit form)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { error, userId } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = putProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const existing = await prisma.product.findUnique({ where: { id, deletedAt: null } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const data = parsed.data;

  // Check slug uniqueness (allow same product)
  const slugConflict = await prisma.product.findFirst({
    where: { slug: data.slug, id: { not: id }, deletedAt: null },
  });
  if (slugConflict) {
    return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Safely handle existing variants to avoid SKU unique constraint conflicts
    const oldVariants = await tx.productVariant.findMany({
      where: { productId: id },
      include: {
        orderItems: { select: { id: true }, take: 1 },
        cartItems: { select: { id: true }, take: 1 },
        inventoryMovements: { select: { id: true }, take: 1 },
      },
    });

    for (const ov of oldVariants) {
      const hasHistory =
        ov.orderItems.length > 0 ||
        ov.cartItems.length > 0 ||
        ov.inventoryMovements.length > 0;
      if (!hasHistory) {
        await tx.productVariant.delete({ where: { id: ov.id } });
      } else {
        await tx.productVariant.update({
          where: { id: ov.id },
          data: {
            sku: `${ov.sku}__archived_${Date.now()}_${ov.id.slice(0, 4)}`,
            deletedAt: new Date(),
            isAvailable: false,
          },
        });
      }
    }

    // Delete old images
    await tx.productImage.deleteMany({ where: { productId: id } });

    // Delete old tags
    await tx.productTag.deleteMany({ where: { productId: id } });

    const result = await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        salePrice: data.salePrice ?? null,
        material: data.material ?? null,
        careInstructions: data.careInstructions ?? null,
        status: data.status,
        variants: {
          create: data.variants.map((v) => ({
            sku: v.sku,
            color: v.color,
            size: v.size,
            priceOverride: v.priceOverride ?? null,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable,
          })),
        },
        tags: {
          create: data.tags.map((name) => ({ name })),
        },
        images: {
          create: data.images.map((url, index) => ({
            url,
            alt: data.name,
            storageKey: url,
            position: index,
          })),
        },
      },
    });

    if (userId) {
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "PRODUCT_UPDATED",
          resource: "Product",
          resourceId: id,
          previous: { name: existing.name, status: existing.status },
          next: { name: data.name, status: data.status },
        },
      });
    }

    return result;
  });

  return NextResponse.json({ productId: updated.id });
}

// PATCH /api/admin/products/[id] — partial field update
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, userId } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = patchProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const existing = await prisma.product.findUnique({ where: { id, deletedAt: null } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.product.update({ where: { id }, data: parsed.data });

    if (userId) {
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "PRODUCT_UPDATED",
          resource: "Product",
          resourceId: id,
          previous: { name: existing.name, status: existing.status, basePrice: existing.basePrice },
          next: parsed.data,
        },
      });
    }

    return result;
  });

  return NextResponse.json({ productId: updated.id });
}

// DELETE /api/admin/products/[id] — soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { error, userId } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id, deletedAt: null } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });

    if (userId) {
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "PRODUCT_DELETED",
          resource: "Product",
          resourceId: id,
          previous: { name: existing.name, status: existing.status },
          next: { deletedAt: new Date().toISOString(), status: "ARCHIVED" },
        },
      });
    }
  });

  return new NextResponse(null, { status: 204 });
}
