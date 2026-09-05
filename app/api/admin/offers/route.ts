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

const createOfferSchema = z.object({
  code: z.string().min(2).max(30).regex(/^[A-Z0-9_-]+$/i),
  title: z.string().min(2).max(100),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().int().min(0),
  minSubtotal: z.number().int().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  endsAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const coupons = await prisma.coupon.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const { code, title, type, value, minSubtotal, usageLimit, endsAt } = parsed.data;
  const upperCode = code.toUpperCase();

  const existing = await prisma.coupon.findFirst({
    where: { code: upperCode, deletedAt: null }
  });

  if (existing) {
    return NextResponse.json({ error: `Coupon code "${upperCode}" already exists.` }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: upperCode,
      title,
      type,
      value: type === "PERCENTAGE" ? Math.min(100, value) : value,
      minSubtotal: minSubtotal ? minSubtotal * 100 : null,
      usageLimit: usageLimit ?? null,
      endsAt: endsAt ? new Date(endsAt) : null,
      status: "ACTIVE",
    }
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
