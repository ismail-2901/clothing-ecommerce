export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminCategoriesManager } from "@/components/admin/admin-categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      parent: { select: { id: true, name: true } },
      _count: {
        select: { products: { where: { deletedAt: null } } },
      },
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  return <AdminCategoriesManager initialCategories={categories} />;
}
