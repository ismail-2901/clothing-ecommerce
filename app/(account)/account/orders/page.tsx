"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Check,
  X,
  Clock,
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
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

type OrderItem = {
  id: string;
  orderNumber: string;
  placedDate: string;
  status: "Processing" | "Delivered" | "Cancelled" | "Shipped";
  total: number;
  itemsCount: number;
  thumbnails: string[];
  steps: Array<{ label: string; date?: string; active: boolean; current?: boolean; cancelled?: boolean }>;
};

const mockOrders: OrderItem[] = [
  {
    id: "o1",
    orderNumber: "ELR-20260905-1842",
    placedDate: "5 Sep, 2026 | 10:42 PM",
    status: "Processing",
    total: 5370,
    itemsCount: 5,
    thumbnails: ["/elaris-women.jpg", "/elaris-hero.jpg", "/elaris-women.jpg"],
    steps: [
      { label: "Order Placed", date: "5 Sep, 10:42 PM", active: true },
      { label: "Confirmed", active: true },
      { label: "Processing", date: "In progress", active: true, current: true },
      { label: "Shipped", active: false },
      { label: "Delivered", active: false }
    ]
  },
  {
    id: "o2",
    orderNumber: "ELR-20260828-1120",
    placedDate: "28 Aug, 2026",
    status: "Delivered",
    total: 3980,
    itemsCount: 3,
    thumbnails: ["/elaris-women.jpg", "/elaris-accessories.jpg", "/elaris-women.jpg"],
    steps: [
      { label: "Order Placed", date: "28 Aug", active: true },
      { label: "Confirmed", date: "28 Aug", active: true },
      { label: "Shipped", date: "29 Aug", active: true },
      { label: "Out for Delivery", date: "31 Aug", active: true },
      { label: "Delivered", date: "1 Sep", active: true }
    ]
  },
  {
    id: "o3",
    orderNumber: "ELR-20260812-0956",
    placedDate: "12 Aug, 2026",
    status: "Cancelled",
    total: 2190,
    itemsCount: 2,
    thumbnails: ["/elaris-men.jpg", "/elaris-women.jpg"],
    steps: [
      { label: "Order Placed", date: "12 Aug", active: true },
      { label: "Cancelled", date: "13 Aug", active: true, cancelled: true },
      { label: "Processing", active: false },
      { label: "Shipped", active: false },
      { label: "Delivered", active: false }
    ]
  },
  {
    id: "o4",
    orderNumber: "ELR-20260725-2210",
    placedDate: "25 Jul, 2026",
    status: "Delivered",
    total: 4280,
    itemsCount: 2,
    thumbnails: ["/elaris-women.jpg", "/elaris-women.jpg"],
    steps: [
      { label: "Order Placed", date: "25 Jul", active: true },
      { label: "Confirmed", active: true },
      { label: "Shipped", date: "26 Jul", active: true },
      { label: "Out for Delivery", date: "28 Jul", active: true },
      { label: "Delivered", date: "29 Jul", active: true }
    ]
  },
  {
    id: "o5",
    orderNumber: "ELR-20260710-1433",
    placedDate: "10 Jul, 2026",
    status: "Delivered",
    total: 2490,
    itemsCount: 1,
    thumbnails: ["/elaris-men.jpg"],
    steps: [
      { label: "Order Placed", date: "10 Jul", active: true },
      { label: "Confirmed", active: true },
      { label: "Shipped", active: true },
      { label: "Out for Delivery", date: "13 Jul", active: true },
      { label: "Delivered", date: "14 Jul", active: true }
    ]
  }
];

export default function AccountOrdersPage() {
  const [filterTab, setFilterTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = mockOrders.filter((order) => {
    if (filterTab !== "all" && order.status.toLowerCase() !== filterTab) return false;
    if (searchQuery.trim() && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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

      {/* 3-Column Layout: Left Nav | Center Orders List | Right Account Overview */}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_260px] items-start">
        {/* Left Customer Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-3 shadow-sm">
            <div className="relative h-11 w-11 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
              <Image src="/elaris-hero.jpg" alt="Ismail" fill className="object-cover" sizes="44px" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">Md. Ismail Hossain</p>
              <p className="text-[10px] text-muted-foreground truncate">ismailhossain@email.com</p>
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
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background px-1">
                5
              </span>
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

          {/* Sidebar newsletter prompt */}
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              My Orders
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Track, manage and view all your orders in one place.
            </p>
          </div>

          {/* Search bar & Filter tabs */}
          <div className="space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number..."
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-2">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${filterTab === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All Orders (5)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("processing")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${filterTab === "processing" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Processing (1)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("shipped")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${filterTab === "shipped" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Shipped (1)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("delivered")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${filterTab === "delivered" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Delivered (2)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("cancelled")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${filterTab === "cancelled" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Cancelled (1)
                </button>
              </div>

              <select className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground focus:outline-none">
                <option>Sort by: Latest</option>
                <option>Sort by: Oldest</option>
              </select>
            </div>
          </div>

          {/* Order Cards */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-background p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs">
                  <div>
                    <span className="font-bold text-foreground text-sm">Order #{order.orderNumber}</span>
                    <p className="text-[11px] text-muted-foreground">Placed on {order.placedDate}</p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {order.status === "Processing" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 text-xs">
                        <span className="h-2 w-2 rounded-full bg-blue-600" /> Processing
                      </span>
                    )}
                    {order.status === "Delivered" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" /> Delivered
                      </span>
                    )}
                    {order.status === "Cancelled" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 font-semibold text-rose-700 text-xs">
                        <span className="h-2 w-2 rounded-full bg-rose-600" /> Cancelled
                      </span>
                    )}
                    {order.status === "Shipped" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 font-semibold text-purple-700 text-xs">
                        <span className="h-2 w-2 rounded-full bg-purple-600" /> Shipped
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Thumbnails + Stepper */}
                <div className="grid gap-6 md:grid-cols-[auto_1fr] items-center">
                  {/* Thumbnails */}
                  <div className="flex items-center gap-2">
                    {order.thumbnails.map((src, i) => (
                      <div key={i} className="relative h-14 w-12 rounded-md overflow-hidden bg-muted border border-border">
                        <Image src={src} alt="Product" fill className="object-cover" sizes="48px" />
                      </div>
                    ))}
                    {order.itemsCount > order.thumbnails.length && (
                      <div className="flex h-14 w-12 items-center justify-center rounded-md border border-border bg-muted/30 text-[11px] font-bold text-muted-foreground">
                        +{order.itemsCount - order.thumbnails.length} items
                      </div>
                    )}
                  </div>

                  {/* Tracking Stepper */}
                  <div className="grid grid-cols-5 gap-1 text-center text-[9px]">
                    {order.steps.map((step, idx) => (
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

                {/* Card Footer: Amount & View Details */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Total Amount</span>
                    <p className="text-sm font-extrabold text-foreground">{formatMoney(order.total)}</p>
                  </div>
                  <Link
                    href={`/checkout/success?orderId=${order.orderNumber}`}
                    className="flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Sidebar: Account Overview & Quick Actions */}
        <aside className="space-y-6">
          {/* Account Overview Widget */}
          <div className="rounded-xl border border-border bg-background p-5 space-y-4 shadow-sm text-xs">
            <div>
              <h2 className="font-bold text-foreground">Account Overview</h2>
              <p className="text-[11px] text-muted-foreground">A quick summary of your activity.</p>
            </div>
            <div className="space-y-2.5 border-t border-border/60 pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-bold text-foreground">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spent</span>
                <span className="font-bold text-foreground">{formatMoney(18310)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Default Address</span>
                <span className="font-semibold text-foreground">Mirpur, Dhaka</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-semibold text-foreground">Jul 2026</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
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

          {/* Support widget */}
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

