import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { formatMoney } from "@/lib/utils/money";

export async function GET() {
  const auth = await requireAdminSession("order:manage");
  if (!auth.ok) return auth.response;

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { quantity: true, name: true, unitPrice: true } },
      payments: { select: { provider: true }, take: 1, orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  const rows: string[] = [
    ["Order #", "Date", "Customer", "Email", "Payment", "Status", "Items", "Total"].join(",")
  ];

  for (const o of orders) {
    const customer =
      o.user?.name ||
      (o.customerSnapshot as Record<string, string> | null)?.name ||
      "Guest";
    const email =
      o.user?.email ||
      (o.customerSnapshot as Record<string, string> | null)?.email ||
      o.guestEmail ||
      "";
    const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
    rows.push(
      [
        o.orderNumber,
        new Date(o.createdAt).toISOString(),
        csv(customer),
        csv(email),
        o.payments[0]?.provider ?? "COD",
        o.status,
        itemCount,
        formatMoney(o.grandTotal)
      ].join(",")
    );
  }

  const body = rows.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${datestamp()}.csv"`
    }
  });
}

function csv(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}
