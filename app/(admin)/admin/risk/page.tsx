export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { AdminRiskManager, type RiskItem } from "@/components/admin/admin-risk-manager";

export default async function AdminRiskPage() {
  const user = await getServerUser();
  const isAdmin =
    user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    ) ?? false;
  if (!isAdmin) redirect("/login");

  const [riskAssessments, totalAssessed, criticalCount, highCount, mediumCount] =
    await Promise.all([
      prisma.riskAssessment.findMany({
        orderBy: { score: "desc" },
        take: 100,
        include: {
          order: {
            select: {
              orderNumber: true,
              grandTotal: true,
              createdAt: true,
              status: true
            }
          },
          customer: {
            select: { id: true, name: true, email: true, phone: true }
          },
          signals: {
            select: { id: true, label: true, weight: true }
          }
        }
      }),
      prisma.riskAssessment.count(),
      prisma.riskAssessment.count({ where: { level: "CRITICAL" } }),
      prisma.riskAssessment.count({ where: { level: "HIGH" } }),
      prisma.riskAssessment.count({ where: { level: "MEDIUM" } })
    ]);

  const items: RiskItem[] = riskAssessments.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    orderNumber: r.order.orderNumber,
    orderTotal: r.order.grandTotal,
    orderStatus: r.order.status,
    orderDate: new Date(r.order.createdAt).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }),
    customerId: r.customerId,
    customerName: r.customer?.name || "Guest Shopper",
    customerEmail: r.customer?.email || "No email",
    customerPhone: r.customer?.phone || null,
    score: r.score,
    level: r.level,
    recommendedAction: r.recommendedAction,
    summary: r.summary,
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    reviewedById: r.reviewedById,
    signals: r.signals.map((s) => ({
      id: s.id,
      label: s.label,
      weight: s.weight
    }))
  }));

  return (
    <AdminRiskManager
      initialAssessments={items}
      totalAssessed={totalAssessed}
      criticalCount={criticalCount}
      highCount={highCount}
      mediumCount={mediumCount}
    />
  );
}
