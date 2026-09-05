export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminReviewsManager } from "@/components/admin/admin-reviews-manager";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { deletedAt: null },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminReviewsManager initialReviews={reviews} />;
}
