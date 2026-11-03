import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  const auth = await requireAdminSession("customer:read");
  if (!auth.ok) return auth.response;

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      orders: {
        select: { id: true, grandTotal: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      },
      riskAssessments: {
        select: { score: true, level: true },
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 5000
  });

  const rows: string[] = [
    [
      "Customer ID",
      "Name",
      "Email",
      "Phone",
      "Total Orders",
      "Delivered Orders",
      "Cancelled Orders",
      "Lifetime Spend (BDT)",
      "Risk Score",
      "Risk Level",
      "Segment",
      "Joined Date",
      "Last Order Date"
    ].join(",")
  ];

  for (const u of users) {
    const ordersCount = u.orders.length;
    const deliveredOrders = u.orders.filter((o) => o.status === "DELIVERED");
    const cancelledOrders = u.orders.filter((o) => o.status === "CANCELLED");
    const returnOrders = u.orders.filter((o) => ["RETURN_REQUESTED", "RETURNED"].includes(o.status));
    const totalSpend = deliveredOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalSpendBdt = (totalSpend / 100).toFixed(2);
    const risk = u.riskAssessments[0];
    const riskScore = risk?.score ?? 0;
    const riskLevel = risk?.level ?? (riskScore >= 80 ? "CRITICAL" : riskScore >= 60 ? "HIGH" : riskScore >= 30 ? "MEDIUM" : "LOW");

    let segment = "NEW";
    if (ordersCount >= 3 && cancelledOrders.length / ordersCount >= 0.33) segment = "CANCEL_HEAVY";
    else if (ordersCount >= 3 && returnOrders.length / ordersCount >= 0.33) segment = "RETURN_HEAVY";
    else if (totalSpend >= 1000000) segment = "HIGH_VALUE";
    else if (ordersCount >= 2) segment = "REPEAT";
    else if (ordersCount === 1) segment = "ACTIVE";

    const lastOrderDate = u.orders[0] ? new Date(u.orders[0].createdAt).toISOString().slice(0, 10) : "";
    const joinedDate = new Date(u.createdAt).toISOString().slice(0, 10);

    rows.push(
      [
        csv(u.id),
        csv(u.name || "Customer"),
        csv(u.email),
        csv(u.phone || ""),
        ordersCount.toString(),
        deliveredOrders.length.toString(),
        cancelledOrders.length.toString(),
        totalSpendBdt,
        riskScore.toString(),
        riskLevel,
        segment,
        joinedDate,
        lastOrderDate
      ].join(",")
    );
  }

  const body = rows.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}

function csv(s: string) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

