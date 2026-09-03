export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminProductForm } from "@/components/admin/admin-product-form";

export default async function AdminProductNewPage() {
  let categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" }
  });

  if (categories.length === 0) {
    await prisma.category.createMany({
      data: [
        { name: "Men", slug: "men" },
        { name: "Women", slug: "women" },
        { name: "Essentials", slug: "essentials" }
      ],
      skipDuplicates: true
    });
    categories = await prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" }
    });
  }

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
