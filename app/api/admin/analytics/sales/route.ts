import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

export type SalesDataPoint = {
  label: string;
  revenue: number;
  orders: number;
};

// GET /api/admin/analytics/sales?period=7%20Days
export async function GET(request: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = request.nextUrl;
  const period = searchParams.get("period") || "7 Days";

  const now = new Date();
  let startDate = new Date();
  let buckets: { label: string; start: Date; end: Date }[] = [];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (period === "7 Days") {
    startDate = new Date(now.getTime() - 6 * 86400000);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate.getTime() + i * 86400000);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      buckets.push({
        label: dayNames[d.getDay()],
        start,
        end
      });
    }
  } else if (period === "30 Days") {
    startDate = new Date(now.getTime() - 28 * 86400000);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 4; i++) {
      const start = new Date(startDate.getTime() + i * 7 * 86400000);
      const end = new Date(startDate.getTime() + (i + 1) * 7 * 86400000 - 1);
      buckets.push({
        label: `Week ${i + 1}`,
        start,
        end
      });
    }
  } else if (period === "90 Days") {
    startDate = new Date(now.getTime() - 90 * 86400000);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 3; i++) {
      const start = new Date(startDate.getTime() + i * 30 * 86400000);
      const end = new Date(startDate.getTime() + (i + 1) * 30 * 86400000 - 1);
      buckets.push({
        label: `Month ${i + 1}`,
        start,
        end
      });
    }
  } else {
    // 1 Year - 4 quarters
    startDate = new Date(now.getTime() - 365 * 86400000);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 4; i++) {
      const start = new Date(startDate.getTime() + i * 91 * 86400000);
      const end = new Date(startDate.getTime() + (i + 1) * 91 * 86400000 - 1);
      buckets.push({
        label: `Q${i + 1}`,
        start,
        end
      });
    }
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] },
        createdAt: { gte: startDate }
      },
      select: {
        grandTotal: true,
        createdAt: true
      }
    });

    const points: SalesDataPoint[] = buckets.map((bucket) => {
      let revenue = 0;
      let orderCount = 0;

      for (const order of orders) {
        const orderTime = order.createdAt.getTime();
        if (orderTime >= bucket.start.getTime() && orderTime <= bucket.end.getTime()) {
          revenue += order.grandTotal;
          orderCount++;
        }
      }

      return {
        label: bucket.label,
        revenue,
        orders: orderCount
      };
    });

    return NextResponse.json({ period, points });
  } catch (err) {
    console.error("[analytics/sales:GET]", err);
    // Return true zero values on error/fallback
    const points: SalesDataPoint[] = buckets.map((b) => ({
      label: b.label,
      revenue: 0,
      orders: 0
    }));
    return NextResponse.json({ period, points });
  }
}
