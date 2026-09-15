import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { formatMoney } from "@/lib/utils/money";

export async function GET() {
  const auth = await requireAdminSession("product:manage");
  if (!auth.ok) return auth.response;

  const variants = await prisma.productVariant.findMany({
    where: { deletedAt: null },
    include: { product: { select: { name: true, slug: true, status: true } } },
    orderBy: [{ product: { name: "asc" } }, { color: "asc" }, { size: "asc" }]
  });

  const rows: string[] = [
    ["SKU", "Product", "Color", "Size", "Stock", "Reserved", "Available", "Price", "Status"].join(",")
  ];

  for (const v of variants) {
    const available = v.stockQuantity - v.reservedQuantity;
    rows.push(
      [
        csv(v.sku),
        csv(v.product.name),
        csv(v.color),
        csv(v.size),
        v.stockQuantity,
        v.reservedQuantity,
        available,
        formatMoney(v.priceOverride ?? 0),
        v.product.status
      ].join(",")
    );
  }

  const body = rows.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventory-${datestamp()}.csv"`
    }
  });
}

function csv(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}
