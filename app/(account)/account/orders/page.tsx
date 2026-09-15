import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Check,
  X,
  Truck,
  RotateCcw,
  MapPin,
  UserRound,
  KeyRound,
  Headphones,
  LayoutDashboard,
  Package,
  Heart,
  Bell,
  Settings,
  HelpCircle
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

export const dynamic = "force-dynamic";

// ── OrderStatus enum values from schema ───────────────────────────────────────
type DBOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED"
  | "FAILED_DELIVERY";

type StepDef = { label: string; date?: string; active: boolean; current?: boolean; cancelled?: boolean };

// Maps DB status to a human label used for tab filtering
function displayStatus(status: DBOrderStatus): string {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
    case "PROCESSING":
    case "PACKED":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "OUT_FOR_DELIVERY":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "RETURN_REQUESTED":
      return "Return Requested";
    case "RETURNED":
      return "Returned";
    case "REFUNDED":
      return "Refunded";
    case "FAILED_DELIVERY":
      return "Failed Delivery";
  }
}

// Build stepper steps from DB status + history timestamps
function buildSteps(
  status: DBOrderStatus,
  history: Array<{ newStatus: string; createdAt: Date }>
): StepDef[] {
  const historyMap = Object.fromEntries(
    history.map((h) => [h.newStatus, h.createdAt])
  );

  const fmt = (d: Date | undefined) =>
    d
      ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      : undefined;

  const isCancelled = status === "CANCELLED" || status === "FAILED_DELIVERY";
  const isReturn = status === "RETURN_REQUESTED" || status === "RETURNED" || status === "REFUNDED";

  if (isCancelled) {
    return [
      { label: "Order Placed", date: fmt(historyMap["PENDING"]), active: true },
      { label: "Cancelled", date: fmt(historyMap["CANCELLED"] ?? historyMap["FAILED_DELIVERY"]), active: true, cancelled: true },
      { label: "Processing", active: false },
      { label: "Shipped", active: false },
      { label: "Delivered", active: false }
    ];
  }

  if (isReturn) {
    return [
      { label: "Delivered", date: fmt(historyMap["DELIVERED"]), active: true },
      { label: "Return Requested", date: fmt(historyMap["RETURN_REQUESTED"]), active: true },
      {
        label: "Returned",
        date: fmt(historyMap["RETURNED"]),
        active: status === "RETURNED" || status === "REFUNDED",
        current: status === "RETURNED"
      },
      {
        label: "Refunded",
        date: fmt(historyMap["REFUNDED"]),
        active: status === "REFUNDED",
        current: status === "REFUNDED"
      }
    ];
  }

  const STEPS: Array<{ status: DBOrderStatus; label: string }> = [
    { status: "PENDING", label: "Order Placed" },
    { status: "CONFIRMED", label: "Confirmed" },
    { status: "PROCESSING", label: "Processing" },
    { status: "SHIPPED", label: "Shipped" },
    { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { status: "DELIVERED", label: "Delivered" }
  ];

  const ORDER: DBOrderStatus[] = [
    "PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"
  ];
  const currentIndex = ORDER.indexOf(status);

  return STEPS.map((s) => {
    const stepIndex = ORDER.indexOf(s.status);
    const active = stepIndex <= currentIndex;
    const current = stepIndex === currentIndex;
    return {
      label: s.label,
      date: fmt(historyMap[s.status]),
      active,
      current: current && status !== "DELIVERED" ? true : undefined
    };
  });
}

function StatusBadge({ status }: { status: DBOrderStatus }) {
  const label = displayStatus(status);
  const style: Record<string, string> = {
    Processing: "bg-blue-50 text-blue-700",
    Shipped: "bg-purple-50 text-purple-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-rose-50 text-rose-700",
    "Failed Delivery": "bg-rose-50 text-rose-700",
    "Return Requested": "bg-amber-50 text-amber-700",
    Returned: "bg-amber-50 text-amber-700",
    Refunded: "bg-teal-50 text-teal-700"
  };
  const dotStyle: Record<string, string> = {
    Processing: "bg-blue-600",
    Shipped: "bg-purple-600",
    Delivered: "bg-emerald-600",
    Cancelled: "bg-rose-600",
    "Failed Delivery": "bg-rose-600",
    "Return Requested": "bg-amber-600",
    Returned: "bg-amber-600",
    Refunded: "bg-teal-600"
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold text-xs ${style[label] ?? "bg-muted text-muted-foreground"}`}>
      <span className={`h-2 w-2 rounded-full ${dotStyle[label] ?? "bg-muted-foreground"}`} />
      {label}
    </span>
  );
}

export default async function AccountOrdersPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const [orders, totalSpentAgg] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            productSnapshot: true
          }
        },
        history: {
          select: { newStatus: true, createdAt: true },
          orderBy: { createdAt: "asc" }
        }
      }
    }),
    prisma.order.aggregate({
      where: { userId: user.id, status: { not: "CANCELLED" } },
      _sum: { grandTotal: true }
    })
  ]);

  const totalSpent = totalSpentAgg._sum.grandTotal ?? 0;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="container-shell py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/account" className="hover:text-foreground">My Account</Link>
        <span>/</span>
        <span className="text-foreground">My Orders</span>
      </nav>

      {/* 3-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_260px] items-start">

        {/* Left Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-3 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-sm font-bold text-foreground uppercase">
              {user.name?.charAt(0) ?? "?"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{user.name ?? "Customer"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              <Link href="/account" className="text-[10px] font-semibold text-foreground hover:underline flex items-center gap-0.5 pt-0.5">
                Edit Profile →
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-2 space-y-1 shadow-sm text-xs font-semibold text-muted-foreground">
            <Link href="/account" className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted hover:text-foreground transition-colors">
              <LayoutDashboard size={15} /> Overview
            </Link>
            <Link href="/account/orders" className="flex items-center gap-2.5 rounded-lg bg-muted px-3 py-2 text-foreground font-bold transition-colors">
              <Package size={15} /> My Orders
            </Link>
            <Link href="/account" className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted hover:text-foreground transition-colors">
              <MapPin size={15} /> Addresses
            </Link>
            <Link href="/account/wishlist" className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted hover:text-foreground transition-colors">
              <div className="flex items-center gap-2.5">
                <Heart size={15} /> Wishlist
              </div>
            </Link>
            <Link href="/account" className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted hover:text-foreground transition-colors">
              <Bell size={15} /> Notifications
            </Link>
            <Link href="/account" className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted hover:text-foreground transition-colors">
              <Settings size={15} /> Account Settings
            </Link>
            <Link href="/contact" className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted hover:text-foreground transition-colors">
              <HelpCircle size={15} /> Help &amp; Support
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-2 text-xs shadow-sm">
            <p className="font-bold text-foreground">Be the first to know</p>
            <p className="text-[11px] text-muted-foreground">Get exclusive offers &amp; style tips.</p>
            <input placeholder="Enter your email" className="h-8 w-full rounded-md border border-border px-2 text-xs" />
            <button className="h-8 w-full rounded-md bg-foreground text-xs font-bold text-background">
              Subscribe
            </button>
          </div>
        </aside>

        {/* Center Orders List */}
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">My Orders</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Track, manage and view all your orders in one place.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
              <Package size={40} className="text-muted-foreground mb-3" />
              <h2 className="text-base font-bold text-foreground">No Orders Yet</h2>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                You haven&apos;t placed any orders. Start shopping and your orders will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-4 rounded-md bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition-colors"
              >
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = order.status as DBOrderStatus;
                const steps = buildSteps(status, order.history as Array<{ newStatus: string; createdAt: Date }>);
                const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
                const thumbnails = order.items
                  .slice(0, 3)
                  .map((i) => {
                    const snap = i.productSnapshot as { image?: string } | null;
                    return snap?.image ?? null;
                  })
                  .filter((src): src is string => !!src);
                const placedDate = order.createdAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });

                return (
                  <div key={order.id} className="rounded-xl border border-border bg-background p-5 space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs">
                      <div>
                        <span className="font-bold text-foreground text-sm">Order #{order.orderNumber}</span>
                        <p className="text-[11px] text-muted-foreground">Placed on {placedDate}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {/* Thumbnails + Stepper */}
                    <div className="grid gap-6 md:grid-cols-[auto_1fr] items-center">
                      <div className="flex items-center gap-2">
                        {thumbnails.length > 0 ? (
                          thumbnails.map((src, i) => (
                            <div key={i} className="relative h-14 w-12 rounded-md overflow-hidden bg-muted border border-border">
                              <Image src={src} alt="Product" fill className="object-cover" sizes="48px" />
                            </div>
                          ))
                        ) : (
                          <div className="flex h-14 w-12 items-center justify-center rounded-md border border-border bg-muted/30 text-[11px] font-bold text-muted-foreground">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </div>
                        )}
                        {itemCount > thumbnails.length && thumbnails.length > 0 && (
                          <div className="flex h-14 w-12 items-center justify-center rounded-md border border-border bg-muted/30 text-[11px] font-bold text-muted-foreground">
                            +{itemCount - thumbnails.length}
                          </div>
                        )}
                      </div>

                      <div className={`grid gap-1 text-center text-[9px]`} style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
                        {steps.map((step, idx) => (
                          <div key={idx} className="space-y-1">
                            <div
                              className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                                step.cancelled
                                  ? "bg-rose-600 text-white"
                                  : step.current
                                  ? "border-2 border-blue-600 bg-blue-50 text-blue-600"
                                  : step.active
                                  ? "bg-foreground text-background"
                                  : "border border-border bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              {step.cancelled ? <X size={12} /> : step.active ? <Check size={12} /> : null}
                            </div>
                            <p className={`font-semibold ${step.active ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            {step.date && <p className="text-[9px] text-muted-foreground">{step.date}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-border/60 pt-3">
                      <div>
                        <span className="text-[11px] text-muted-foreground">Total Amount</span>
                        <p className="text-sm font-extrabold text-foreground">{formatMoney(order.grandTotal)}</p>
                      </div>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-5 space-y-4 shadow-sm text-xs">
            <div>
              <h2 className="font-bold text-foreground">Account Overview</h2>
              <p className="text-[11px] text-muted-foreground">A quick summary of your activity.</p>
            </div>
            <div className="space-y-2.5 border-t border-border/60 pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-bold text-foreground">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spent</span>
                <span className="font-bold text-foreground">{formatMoney(totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-semibold text-foreground">{memberSince}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-5 space-y-3 shadow-sm text-xs">
            <h2 className="font-bold text-foreground">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/account/orders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Truck size={14} /> Track an Order
              </Link>
              <Link href="/contact" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <RotateCcw size={14} /> Return an Item
              </Link>
              <Link href="/account" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <MapPin size={14} /> Manage Addresses
              </Link>
              <Link href="/account" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <UserRound size={14} /> Update Profile
              </Link>
              <Link href="/account" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <KeyRound size={14} /> Change Password
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-5 space-y-3 shadow-sm text-xs">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Headphones size={16} /> Need Help?
            </div>
            <p className="text-[11px] text-muted-foreground">Our support team is here for you.</p>
            <Link
              href="/contact"
              className="flex h-9 w-full items-center justify-center rounded-md border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Contact Support →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
