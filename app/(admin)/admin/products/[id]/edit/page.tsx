export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/db/prisma";
import { AdminProductForm, type ProductFormInitialData } from "@/components/admin/admin-product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;

  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: { select: { id: true, name: true } },
      children: {
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true },
        orderBy: [{ position: "asc" }, { name: "asc" }]
      }
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
    include: {
      variants: { where: { deletedAt: null }, orderBy: [{ color: "asc" }, { size: "asc" }] },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });

  if (!product) notFound();

  // Group flat variants by color → VariantGroup[]
  const groupMap = new Map<string, { sizes: string[]; stockQuantity: number; priceOverride?: number }>();
  for (const v of product.variants) {
    const key = v.color;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        sizes: [],
        stockQuantity: v.stockQuantity,
        priceOverride: v.priceOverride ?? undefined
      });
    }
    const sizeParts = v.size.includes(",")
      ? v.size.split(",").map((s) => s.trim()).filter(Boolean)
      : [v.size];
    for (const s of sizeParts) {
      if (!groupMap.get(key)!.sizes.includes(s)) {
        groupMap.get(key)!.sizes.push(s);
      }
    }
  }

  const variantGroups: ProductFormInitialData["variantGroups"] = Array.from(
    groupMap.entries()
  ).map(([color, { sizes, stockQuantity, priceOverride }], i) => ({
    id: String(i + 1),
    color,
    sizes,
    sku: "",
    stockQuantity,
    priceOverride
  }));

  const initialData: ProductFormInitialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    material: product.material,
    careInstructions: product.careInstructions,
    status: product.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    imageUrl: product.images[0]?.url ?? null,
    variantGroups,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition w-fit"
          >
            <ArrowLeft size={13} />
            <span>Back to Products</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Edit Product
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                product.status === "PUBLISHED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : product.status === "DRAFT"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700"
              }`}
            >
              {product.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update specifications, variant matrices, and images for{" "}
            <strong className="text-foreground">{product.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition shadow-xs"
          >
            Storefront
          </Link>
          <DeleteProductButton
            productId={product.id}
            productName={product.name}
            redirectTo="/admin/products"
          />
        </div>
      </div>

      <AdminProductForm categories={categories} initialData={initialData} />
    </div>
  );
}
