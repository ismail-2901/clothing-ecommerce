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

const patchOfferSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = patchOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { id, deletedAt: null } });
  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }

  const updated = await prisma.coupon.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ coupon: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({ where: { id, deletedAt: null } });
  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }

  await prisma.coupon.update({
    where: { id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  return new NextResponse(null, { status: 204 });
}
