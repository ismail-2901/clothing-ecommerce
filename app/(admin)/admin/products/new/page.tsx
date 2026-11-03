export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/db/prisma";
import { AdminProductForm } from "@/components/admin/admin-product-form";

export default async function AdminProductNewPage() {
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
    orderBy: [{ position: "asc" }, { name: "asc" }]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition w-fit"
        >
          <ArrowLeft size={13} />
          <span>Back to Products</span>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Add New Product
          </h1>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            Catalog Creation
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Define product specifications, upload imagery, and generate color/size variant matrices for your live store.
        </p>
      </div>

      <AdminProductForm categories={categories} />
    </div>
  );
}
