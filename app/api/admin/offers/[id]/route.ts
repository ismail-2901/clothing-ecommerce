import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";

type RouteParams = { params: Promise<{ id: string }> };

const patchOfferSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  title: z.string().min(1).optional(),
  /** minSubtotal passed in BDT taka from admin form; converted to paisa before storage */
  minSubtotal: z.number().int().min(0).nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminSession("offer:manage");
  if (!auth.ok) return auth.response;

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

  const { status, title, minSubtotal, usageLimit, endsAt } = parsed.data;

  const updated = await prisma.coupon.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(title !== undefined && { title }),
      // BUG-24 FIX: Convert BDT taka to paisa for DB consistency with coupons/validate
      ...(minSubtotal !== undefined && {
        minSubtotal: minSubtotal !== null ? minSubtotal * 100 : null
      }),
      ...(usageLimit !== undefined && { usageLimit }),
      ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null })
    },
  });

  return NextResponse.json({ coupon: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminSession("offer:manage");
  if (!auth.ok) return auth.response;

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
