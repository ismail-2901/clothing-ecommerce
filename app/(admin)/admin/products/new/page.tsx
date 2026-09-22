export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { STANDARD_CATEGORIES } from "@/lib/constants/categories";

export default async function AdminProductNewPage() {
  await prisma.category.createMany({
    data: STANDARD_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      position: c.position,
      description: c.description
    })),
    skipDuplicates: true
  });

  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: [{ position: "asc" }, { name: "asc" }]
  });

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Catalog Operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Add New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a real product with variants and publish it to your live store.
        </p>
      </div>
      <AdminProductForm categories={categories} />
    </div>
  );
}
