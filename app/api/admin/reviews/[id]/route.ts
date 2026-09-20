import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";

type RouteParams = { params: Promise<{ id: string }> };

const patchReviewSchema = z.object({
  isVisible: z.boolean(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // BUG-26 FIX: Review visibility toggle is a mutation — require customer:manage, not read
  const auth = await requireAdminSession("customer:manage");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = patchReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const review = await prisma.review.findUnique({ where: { id, deletedAt: null } });
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { isVisible: parsed.data.isVisible },
  });

  return NextResponse.json({ review: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // BUG-26 FIX: Review deletion is a mutation — require customer:manage, not read
  const auth = await requireAdminSession("customer:manage");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id, deletedAt: null } });
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  await prisma.review.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
