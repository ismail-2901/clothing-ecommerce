import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  const auth = await requireAdminSession("product:manage");
  if (!auth.ok) return auth.response;

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { name: true } },
      variants: { select: { sku: true, stockQuantity: true, size: true, color: true } }
    },
    orderBy: { name: "asc" }
  });

  const rows: string[] = [
    ["ID", "Name", "Slug", "Category", "Status", "Base Price", "Variants", "Total Stock"].join(",")
  ];

  for (const p of products) {
    const totalStock = p.variants.reduce((s, v) => s + v.stockQuantity, 0);
    rows.push(
      [
        p.id,
        csv(p.name),
        csv(p.slug),
        csv(p.category?.name ?? ""),
        p.status,
        p.basePrice,
        p.variants.length,
        totalStock
      ].join(",")
    );
  }

  const body = rows.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${datestamp()}.csv"`
    }
  });
}

function csv(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}
