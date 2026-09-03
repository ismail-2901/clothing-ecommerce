export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";
import { AdminProductForm, type ProductFormInitialData } from "@/components/admin/admin-product-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;

  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
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
  const groupMap = new Map<string, { sizes: string[]; stockQuantity: number }>();
  for (const v of product.variants) {
    const key = v.color;
    if (!groupMap.has(key)) {
      groupMap.set(key, { sizes: [], stockQuantity: v.stockQuantity });
    }
    groupMap.get(key)!.sizes.push(v.size);
  }

  const variantGroups: ProductFormInitialData["variantGroups"] = Array.from(
    groupMap.entries()
  ).map(([color, { sizes, stockQuantity }], i) => ({
    id: String(i + 1),
    color,
    sizes,
    sku: "",
    stockQuantity,
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
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Catalog Operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update details, variants, and images for{" "}
          <span className="font-medium text-foreground">{product.name}</span>.
        </p>
      </div>
      <AdminProductForm categories={categories} initialData={initialData} />
    </div>
  );
}
