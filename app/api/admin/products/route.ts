import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";

import { isValidAdminSession } from "@/lib/auth/admin-auth";

async function requireAdmin(request: NextRequest) {
  // Check master admin password session first
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

  const isAdmin = userRoles.some((ur) =>
    ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
  );

  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), userId: null };
  }

  return { error: null, userId: session.userId };
}

const variantSchema = z.object({
  sku: z.string().min(1).max(100),
  color: z.string().min(1).max(50),
  size: z.string().min(1).max(20),
  priceOverride: z.int().min(0).optional(),
  stockQuantity: z.int().min(0),
  isAvailable: z.boolean().default(true)
});

const createProductSchema = z.object({
  categoryId: z.string().min(1),
  collectionId: z.string().optional(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  basePrice: z.int().min(1),
  salePrice: z.int().min(0).optional(),
  costPrice: z.int().min(0).optional(),
  material: z.string().max(500).optional(),
  careInstructions: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  images: z.array(z.string().url()).optional().default([]),
  variants: z.array(variantSchema).min(1)
});

// GET /api/admin/products — paginated list
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 30;
  const skip = (page - 1) * limit;
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const where = {
    deletedAt: null,
    ...(status && { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { variants: { some: { sku: { contains: q, mode: "insensitive" as const } } } }
      ]
    })
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        variants: { select: { id: true, sku: true, color: true, size: true, priceOverride: true, stockQuantity: true, reservedQuantity: true } },
        images: { orderBy: { position: "asc" }, take: 1 }
      }
    }),
    prisma.product.count({ where })
  ]);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/admin/products — create product
export async function POST(request: NextRequest) {
  const { error, userId } = await requireAdmin(request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;

  // Check unique slug
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
  }

  // Check unique SKUs
  const skus = data.variants.map((v) => v.sku);
  const duplicateSku = await prisma.productVariant.findFirst({ where: { sku: { in: skus } } });
  if (duplicateSku) {
    return NextResponse.json({ error: `SKU ${duplicateSku.sku} is already in use.` }, { status: 409 });
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        categoryId: data.categoryId,
        collectionId: data.collectionId ?? null,
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        salePrice: data.salePrice ?? null,
        costPrice: data.costPrice ?? null,
        material: data.material ?? null,
        careInstructions: data.careInstructions ?? null,
        status: data.status,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        variants: {
          create: data.variants.map((v) => ({
            sku: v.sku,
            color: v.color,
            size: v.size,
            priceOverride: v.priceOverride ?? null,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable
          }))
        },
        tags: {
          create: data.tags.map((name) => ({ name }))
        },
        images: {
          create: (data.images ?? []).map((url, index) => ({
            url,
            alt: data.name,
            storageKey: url,
            position: index
          }))
        }
      },
      include: { variants: true, tags: true, images: true }
    });

    if (userId) {
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "PRODUCT_CREATED",
          resource: "Product",
          resourceId: created.id,
          next: { name: data.name, slug: data.slug, status: data.status }
        }
      });
    }

    return created;
  });

  return NextResponse.json({ productId: product.id, slug: product.slug }, { status: 201 });
}
