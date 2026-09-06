export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminCustomersManager } from "@/components/admin/admin-customers-manager";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const { q } = (await searchParams) || {};

  const whereClause: Record<string, unknown> = {
    deletedAt: null,
  };

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      orders: {
        where: { status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } },
        select: { grandTotal: true }
      },
      riskAssessments: {
        select: { score: true },
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const customers = users.map((u) => {
    const orderCount = u.orders.length;
    const totalSpent = u.orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const riskScore = u.riskAssessments[0]?.score ?? 0;

    return {
      id: u.id,
      name: u.name || "Customer",
      email: u.email,
      phone: u.phone,
      ordersCount: orderCount,
      totalSpend: totalSpent,
      riskScore,
      joinedDate: u.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
    };
  });

  return <AdminCustomersManager customers={customers} />;
}
