import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";

async function requireAdmin(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null };
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.userId },
    include: { role: true }
  });

  const isAdmin = userRoles.some((ur) =>
    ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
  );

  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), userId: null };
  }

  return { error: null, userId: session.userId };
}

type RouteParams = { params: Promise<{ id: string }> };

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  basePrice: z.int().min(1).optional(),
  salePrice: z.int().min(0).nullable().optional(),
  material: z.string().max(500).nullable().optional(),
  careInstructions: z.string().max(500).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional()
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
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      images: { orderBy: { position: "asc" } },
      tags: true
    }
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PATCH /api/admin/products/[id]
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

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const existing = await prisma.product.findUnique({ where: { id, deletedAt: null } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.product.update({
      where: { id },
      data: parsed.data
    });

    await tx.auditLog.create({
      data: {
        actorId: userId!,
        action: "PRODUCT_UPDATED",
        resource: "Product",
        resourceId: id,
        previous: {
          name: existing.name,
          status: existing.status,
          basePrice: existing.basePrice
        },
        next: parsed.data
      }
    });

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
      data: { deletedAt: new Date(), status: "ARCHIVED" }
    });

    await tx.auditLog.create({
      data: {
        actorId: userId!,
        action: "PRODUCT_DELETED",
        resource: "Product",
        resourceId: id,
        previous: { name: existing.name, status: existing.status },
        next: { deletedAt: new Date().toISOString(), status: "ARCHIVED" }
      }
    });
  });

  return new NextResponse(null, { status: 204 });
}
