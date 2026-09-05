export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminOffersManager } from "@/components/admin/admin-offers-manager";

export default async function AdminOffersPage() {
  const coupons = await prisma.coupon.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return <AdminOffersManager initialCoupons={coupons} />;
}
