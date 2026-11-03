export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminInventoryManager, type AdminInventoryRow } from "@/components/admin/admin-inventory-manager";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const { q, status, page: pageParam } = (await searchParams) || {};
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = 30;
  const skip = (page - 1) * pageSize;

  const lowStockThreshold = 5;

  const whereClause: Record<string, unknown> = {
    deletedAt: null,
    product: { deletedAt: null },
  };

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { sku: { contains: term, mode: "insensitive" } },
      { color: { contains: term, mode: "insensitive" } },
      { size: { contains: term, mode: "insensitive" } },
      { product: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  if (status === "low") {
    whereClause.stockQuantity = { gt: 0, lte: lowStockThreshold };
  } else if (status === "out") {
    whereClause.stockQuantity = { lte: 0 };
  } else if (status === "in") {
    whereClause.stockQuantity = { gt: lowStockThreshold };
  }

  const [dbVariants, filteredCount, totalSKUs, inStockCount, lowStockCount, outOfStockCount] =
    await Promise.all([
      prisma.productVariant.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              images: { take: 1, orderBy: { position: "asc" }, select: { url: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.productVariant.count({ where: whereClause }),
      prisma.productVariant.count({
        where: { deletedAt: null, product: { deletedAt: null } }
      }),
      prisma.productVariant.count({
        where: {
          deletedAt: null,
          product: { deletedAt: null },
          stockQuantity: { gt: lowStockThreshold }
        }
      }),
      prisma.productVariant.count({
        where: {
          deletedAt: null,
          product: { deletedAt: null },
          stockQuantity: { gt: 0, lte: lowStockThreshold }
        }
      }),
      prisma.productVariant.count({
        where: {
          deletedAt: null,
          product: { deletedAt: null },
          stockQuantity: { lte: 0 }
        }
      })
    ]);

  const variants: AdminInventoryRow[] = dbVariants.map((v) => ({
    id: v.id,
    productId: v.product.id,
    productName: v.product.name,
    productSlug: v.product.slug,
    productImage: v.product.images[0]?.url || "/elaris-women.jpg",
    sku: v.sku,
    color: v.color,
    size: v.size,
    stock: v.stockQuantity,
    reserved: v.reservedQuantity,
    price: v.priceOverride ?? v.product.basePrice,
    isAvailable: v.isAvailable
  }));

  const totalPages = Math.ceil(filteredCount / pageSize);

  return (
    <AdminInventoryManager
      variants={variants}
      totalSKUs={totalSKUs}
      inStockCount={inStockCount}
      lowStockCount={lowStockCount}
      outOfStockCount={outOfStockCount}
      lowStockThreshold={lowStockThreshold}
      currentStatus={status}
      searchQuery={q}
      page={page}
      totalPages={totalPages}
    />
  );
}
