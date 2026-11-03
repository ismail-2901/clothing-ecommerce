export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import { getServerUser } from "@/lib/auth/server";
import { AdminOrderDocuments } from "@/components/admin/admin-order-documents";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ template?: string; auto?: string }>;
};

export default async function OrderPrintPage({ params, searchParams }: PageProps) {
  const user = await getServerUser();
  const isAdmin =
    user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    ) ?? false;

  if (!isAdmin) redirect("/login");

  const { id } = await params;
  const { template } = (await searchParams) || {};

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }]
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
          variant: { select: { sku: true, color: true, size: true } }
        }
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!order) notFound();

  const formattedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    grandTotal: order.grandTotal,
    user: order.user,
    customerSnapshot: order.customerSnapshot as Record<string, any> | null,
    deliveryAddress: order.deliveryAddress as Record<string, any> | null,
    items: order.items.map((i) => ({
      id: i.id,
      name: i.name,
      color: i.color || i.variant?.color,
      size: i.size || i.variant?.size,
      sku: i.sku || i.variant?.sku,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
      productSnapshot: i.productSnapshot as Record<string, any> | null
    })),
    payments: order.payments
  };

  const validTemplates = ["invoice", "pathao", "steadfast", "redx"] as const;
  const activeTemplate = validTemplates.includes(template as any)
    ? (template as (typeof validTemplates)[number])
    : "invoice";

  return (
    <div className="min-h-screen bg-white">
      <AdminOrderDocuments
        order={formattedOrder}
        defaultTemplate={activeTemplate}
        isModal={false}
      />
    </div>
  );
}

