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

  const isAdmin = userRoles.some((ur) =>
    ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
  );

  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), userId: null };
  }

  return { error: null, userId: session.userId };
}

type RouteParams = { params: Promise<{ id: string }> };

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

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

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const category = await prisma.category.findUnique({ where: { id, deletedAt: null } });
  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  const data = parsed.data;

  if (data.slug && data.slug !== category.slug) {
    const conflict = await prisma.category.findFirst({
      where: { slug: data.slug, id: { not: id }, deletedAt: null }
    });
    if (conflict) {
      return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data
  });

  if (userId) {
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "CATEGORY_UPDATED",
        resource: "Category",
        resourceId: id,
        previous: { name: category.name, slug: category.slug },
        next: data
      }
    });
  }

  return NextResponse.json({ category: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { error, userId } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id, deletedAt: null },
    include: {
      _count: {
        select: { products: { where: { deletedAt: null } } }
      }
    }
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  if (category._count.products > 0) {
    return NextResponse.json(
      { error: `Cannot delete category with ${category._count.products} active product(s). Move products first.` },
      { status: 400 }
    );
  }

  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  if (userId) {
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "CATEGORY_DELETED",
        resource: "Category",
        resourceId: id,
        previous: { name: category.name, slug: category.slug }
      }
    });
  }

  return new NextResponse(null, { status: 204 });
}
