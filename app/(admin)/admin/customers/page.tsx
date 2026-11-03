export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminCustomersManager, type CustomerCRMItem } from "@/components/admin/admin-customers-manager";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const { q } = (await searchParams) || {};

  const whereClause: Record<string, unknown> = {
    deletedAt: null
  };

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } }
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      orders: {
        select: { id: true, orderNumber: true, grandTotal: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      },
      addresses: {
        where: { deletedAt: null },
        take: 1,
        orderBy: { isDefault: "desc" },
        select: { city: true, line1: true }
      },
      riskAssessments: {
        select: {
          score: true,
          level: true,
          recommendedAction: true,
          signals: { select: { label: true } }
        },
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const customers: CustomerCRMItem[] = users.map((u) => {
    const ordersCount = u.orders.length;
    const deliveredOrders = u.orders.filter((o) => o.status === "DELIVERED");
    const cancelledOrders = u.orders.filter((o) => o.status === "CANCELLED");
    const returnOrders = u.orders.filter((o) =>
      ["RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(o.status)
    );

    // Lifetime spend includes confirmed/delivered revenue; for overall order activity calculate minor total
    const totalSpend = deliveredOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalGrossRevenue = u.orders
      .filter((o) => !["CANCELLED", "FAILED_DELIVERY"].includes(o.status))
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const averageOrderValue = ordersCount > 0 ? Math.round(totalGrossRevenue / ordersCount) : 0;

    const risk = u.riskAssessments[0];
    const riskScore = risk?.score ?? 0;
    const riskLevel =
      risk?.level ??
      (riskScore >= 80 ? "CRITICAL" : riskScore >= 60 ? "HIGH" : riskScore >= 30 ? "MEDIUM" : "LOW");
    const riskSignals = risk?.signals.map((s) => s.label) ?? [];

    let segment: CustomerCRMItem["segment"] = "NEW";
    if (ordersCount >= 3 && cancelledOrders.length / ordersCount >= 0.33) {
      segment = "CANCEL_HEAVY";
    } else if (ordersCount >= 3 && returnOrders.length / ordersCount >= 0.33) {
      segment = "RETURN_HEAVY";
    } else if (totalSpend >= 1000000 || totalGrossRevenue >= 1500000) {
      segment = "HIGH_VALUE";
    } else if (ordersCount >= 2) {
      segment = "REPEAT";
    } else if (ordersCount === 1) {
      segment = "ACTIVE";
    }

    const lastOrder = u.orders[0];
    const lastOrderDate = lastOrder
      ? new Date(lastOrder.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : null;

    return {
      id: u.id,
      name: u.name || "Customer",
      email: u.email,
      phone: u.phone,
      ordersCount,
      deliveredCount: deliveredOrders.length,
      cancelledCount: cancelledOrders.length,
      returnCount: returnOrders.length,
      totalSpend: totalSpend > 0 ? totalSpend : totalGrossRevenue,
      averageOrderValue,
      riskScore,
      riskLevel,
      riskSignals,
      segment,
      joinedDate: new Date(u.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      lastOrderDate,
      defaultCity: u.addresses[0]?.city ?? null,
      recentOrders: u.orders.slice(0, 3).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        grandTotal: o.grandTotal,
        status: o.status,
        date: new Date(o.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })
      }))
    };
  });

  return <AdminCustomersManager customers={customers} />;
}
