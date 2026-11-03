import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("risk:review");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: { actionTaken?: string; notes?: string } = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }

  const assessment = await prisma.riskAssessment.findUnique({
    where: { id },
    include: { order: true }
  });

  if (!assessment) {
    return NextResponse.json({ error: "Risk assessment not found" }, { status: 404 });
  }

  const updated = await prisma.riskAssessment.update({
    where: { id },
    data: {
      reviewedAt: new Date(),
      reviewedById: auth.userId,
      summary: body.notes
        ? `${assessment.summary ? assessment.summary + " | " : ""}Review note: ${body.notes.slice(0, 300)}`
        : assessment.summary
    }
  });

  // Record immutable audit log
  await prisma.auditLog.create({
    data: {
      actorId: auth.userId,
      action: "RISK_ASSESSMENT_REVIEWED",
      resource: "RiskAssessment",
      resourceId: assessment.id,
      previous: {
        reviewedAt: assessment.reviewedAt,
        reviewedById: assessment.reviewedById
      },
      next: {
        reviewedAt: updated.reviewedAt,
        reviewedById: updated.reviewedById,
        actionTaken: body.actionTaken ?? assessment.recommendedAction,
        notes: body.notes ?? null
      },
      metadata: {
        orderId: assessment.orderId,
        orderNumber: assessment.order.orderNumber,
        score: assessment.score,
        level: assessment.level,
        recommendedAction: assessment.recommendedAction
      }
    }
  });

  return NextResponse.json({
    ok: true,
    assessment: {
      id: updated.id,
      reviewedAt: updated.reviewedAt,
      reviewedById: updated.reviewedById
    }
  });
}

