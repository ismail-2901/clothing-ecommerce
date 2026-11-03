export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminProductsManager, type AdminProductRow } from "@/components/admin/admin-products-manager";
import type { ProductStatus } from "@prisma/client";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { q, status, category, page: pageParam } = (await searchParams) || {};
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const whereClause: Record<string, unknown> = {
    deletedAt: null,
  };

  const andConditions: Record<string, unknown>[] = [];

  if (status && ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(status.toUpperCase())) {
    whereClause.status = status.toUpperCase() as ProductStatus;
  }

  if (q && q.trim()) {
    const term = q.trim();
    andConditions.push({
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { category: { name: { contains: term, mode: "insensitive" } } },
        { category: { parent: { name: { contains: term, mode: "insensitive" } } } },
        { variants: { some: { sku: { contains: term, mode: "insensitive" } } } },
      ],
    });
  }

  if (category && category.trim()) {
    andConditions.push({
      OR: [
        { categoryId: category },
        { category: { parentId: category } },
      ],
    });
  }

  if (andConditions.length > 0) {
    whereClause.AND = andConditions;
  }

  const [dbProducts, filteredCount, totalCount, publishedCount, draftCount, allCategories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            parent: { select: { id: true, name: true } }
          }
        },
        images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        variants: {
          where: { deletedAt: null },
          select: { id: true, sku: true, color: true, size: true, priceOverride: true, stockQuantity: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.count({ where: whereClause }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.product.count({ where: { status: "DRAFT", deletedAt: null } }),
    prisma.category.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        parentId: true,
        children: {
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: [{ position: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    }),
  ]);

  const products: AdminProductRow[] = dbProducts.map((p) => {
    const prices = p.variants.map((v) => v.priceOverride ?? p.basePrice);
    const minPrice = prices.length > 0 ? Math.min(...prices) : p.basePrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : p.basePrice;
    const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const image = p.images[0]?.url || "/elaris-women.jpg";

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image,
      category: p.category?.name || "Uncategorized",
      categoryId: p.category?.id,
      parentCategory: p.category?.parent?.name || null,
      variantsCount: p.variants.length,
      minPrice,
      maxPrice,
      totalStock,
      status: p.status
    };
  });

  const lowStockCount = products.filter((p) => p.totalStock <= 5).length;
  const totalPages = Math.ceil(filteredCount / pageSize);

  return (
    <AdminProductsManager
      products={products}
      totalCount={totalCount}
      publishedCount={publishedCount}
      draftCount={draftCount}
      lowStockCount={lowStockCount}
      allCategories={allCategories}
      currentStatus={status}
      searchQuery={q}
      currentCategory={category}
      page={page}
      totalPages={totalPages}
    />
  );
}
