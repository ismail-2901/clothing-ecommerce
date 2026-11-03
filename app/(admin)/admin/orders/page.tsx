export const dynamic = "force-dynamic";

import Link from "next/link";
import { formatMoney } from "@/lib/utils/money";
import { Download, ShoppingBag, Clock, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { prisma } from "@/db/prisma";
import { AdminSearchInput } from "@/components/admin/admin-search-input";
import {
  AdminOrdersManager,
  type AdminOrderRow,
  type StatusCounts
} from "@/components/admin/admin-orders-manager";
import type { OrderStatus } from "@/features/orders/state-machine";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { q, status } = (await searchParams) || {};

  const whereClause: Record<string, unknown> = {};

  if (status && status.trim()) {
    const st = status.trim().toUpperCase();
    if (st === "RETURNED") {
      whereClause.status = {
        in: ["RETURN_REQUESTED", "RETURNED", "REFUNDED", "FAILED_DELIVERY"]
      };
    } else {
      whereClause.status = st as OrderStatus;
    }
  }

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { guestEmail: { contains: term, mode: "insensitive" } },
      { guestPhone: { contains: term, mode: "insensitive" } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
      { user: { phone: { contains: term, mode: "insensitive" } } }
    ];
  }

  // Fetch orders with relations, status counts, and KPIs in parallel
  const [
    rawOrders,
    totalCount,
    pendingCount,
    confirmedCount,
    processingCount,
    packedCount,
    shippedCount,
    outForDeliveryCount,
    deliveredCount,
    cancelledCount,
    returnsCount,
    revenueAgg
  ] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          select: {
            id: true,
            name: true,
            color: true,
            size: true,
            sku: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
            productSnapshot: true
          }
        },
        payments: {
          select: { status: true, provider: true, providerPaymentId: true },
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 60
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "PACKED" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "OUT_FOR_DELIVERY" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.count({
      where: {
        status: { in: ["RETURN_REQUESTED", "RETURNED", "REFUNDED", "FAILED_DELIVERY"] }
      }
    }),
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } },
      _sum: { grandTotal: true }
    })
  ]);

  const counts: StatusCounts = {
    ALL: totalCount,
    PENDING: pendingCount,
    CONFIRMED: confirmedCount,
    PROCESSING: processingCount,
    PACKED: packedCount,
    SHIPPED: shippedCount,
    OUT_FOR_DELIVERY: outForDeliveryCount,
    DELIVERED: deliveredCount,
    CANCELLED: cancelledCount,
    RETURNS: returnsCount
  };

  const inTransitSum = processingCount + packedCount + shippedCount + outForDeliveryCount;
  const reviewSum = pendingCount + confirmedCount;
  const totalRevenue = revenueAgg._sum.grandTotal || 0;

  // Format orders for table and printable generator
  const formattedOrders: AdminOrderRow[] = rawOrders.map((o) => {
    const custSnapshot = o.customerSnapshot as Record<string, string> | null;
    const address = o.deliveryAddress as Record<string, string> | null;

    const customerName =
      o.user?.name ||
      custSnapshot?.name ||
      address?.name ||
      "Guest Customer";

    const customerEmail =
      o.user?.email ||
      custSnapshot?.email ||
      o.guestEmail ||
      "No email";

    const customerPhone =
      address?.phone ||
      o.user?.phone ||
      custSnapshot?.phone ||
      o.guestPhone ||
      null;

    const createdDate = new Date(o.createdAt);

    return {
      id: o.id,
      orderNumber: o.orderNumber || o.id.slice(-6).toUpperCase(),
      customer: customerName,
      email: customerEmail,
      phone: customerPhone,
      itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      firstItem: o.items[0]?.name || "Apparel Item",
      total: o.grandTotal,
      grandTotal: o.grandTotal,
      status: o.status as OrderStatus,
      paymentMethod: o.payments[0]?.provider || "COD",
      paymentStatus: o.paymentStatus || o.payments[0]?.status || "PENDING",
      date: createdDate.toLocaleDateString("en-BD", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      time: createdDate.toLocaleTimeString("en-BD", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      rawDate: createdDate.toISOString(),
      subtotal: o.subtotal,
      discountTotal: o.discountTotal,
      shippingTotal: o.shippingTotal,
      deliveryAddress: o.deliveryAddress as Record<string, any> | null,
      customerSnapshot: o.customerSnapshot as Record<string, any> | null,
      items: o.items.map((i) => ({
        id: i.id,
        name: i.name,
        color: i.color,
        size: i.size,
        sku: i.sku,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        productSnapshot: i.productSnapshot as Record<string, any> | null
      })),
      payments: o.payments
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Orders &amp; Fulfillment Control Center
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-bold text-foreground font-mono">
              {totalCount} Total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage customer transactions, dispatch fulfillment workflows, and generate courier
            consignments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/admin/export/orders"
            download
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-muted/40 transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* 4 Compact Enterprise KPI Cards */}
      <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Volume & Revenue */}
        <div className="rounded-xl border border-border bg-background p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag size={15} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground font-mono">{totalCount}</span>
            <span className="text-xs font-bold text-muted-foreground font-mono">
              {formatMoney(totalRevenue)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Lifetime volume &amp; gross sales</p>
        </div>

        {/* Card 2: Needs Review (Pending & Confirmed) */}
        <div className="rounded-xl border border-border bg-background p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Awaiting Review</span>
            <Clock size={15} className="text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono">{reviewSum}</span>
            {pendingCount > 0 && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Requires staff confirmation</p>
        </div>

        {/* Card 3: In Fulfillment Pipeline */}
        <div className="rounded-xl border border-border bg-background p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">In Fulfillment</span>
            <Package size={15} className="text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 font-mono">{inTransitSum}</span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              Packing &amp; Transit
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Processing or with courier</p>
        </div>

        {/* Card 4: Delivered & Completed */}
        <div className="rounded-xl border border-border bg-background p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Delivered</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{deliveredCount}</span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Successful
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Successfully closed orders</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="rounded-xl border border-border bg-background p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <AdminSearchInput placeholder="Search by order #, customer name, email, or phone…" />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-bold text-foreground">{formattedOrders.length}</span>{" "}
          orders matching criteria
        </div>
      </div>

      {/* Main Interactive Table & Bulk Controls */}
      <AdminOrdersManager
        orders={formattedOrders}
        counts={counts}
        currentStatus={status}
        searchQuery={q}
      />
    </div>
  );
}
