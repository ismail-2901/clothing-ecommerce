export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminCategoriesManager } from "@/components/admin/admin-categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { products: { where: { deletedAt: null } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return <AdminCategoriesManager initialCategories={categories} />;
}
