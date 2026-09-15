import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  imageUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession("product:manage");
  if (!auth.ok) return auth.response;

  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { products: { where: { deletedAt: null } } }
      }
    },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ categories });
}

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

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const { name, slug, description, imageUrl } = parsed.data;

  const existing = await prisma.category.findFirst({
    where: { slug, deletedAt: null }
  });

  if (existing) {
    return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
    }
  });

  if (userId) {
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "CATEGORY_CREATED",
        resource: "Category",
        resourceId: category.id,
        next: { name, slug }
      }
    });
  }

  return NextResponse.json({ category }, { status: 201 });
}
