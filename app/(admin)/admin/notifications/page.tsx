"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  ShieldAlert,
  Star,
  Mail,
  Smartphone,
  Check,
  Trash2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  type: "ORDER" | "STOCK" | "SECURITY" | "REVIEW";
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "ORDER",
    title: "New Order Placed (#ORD-9201)",
    description: "Farhana Rahman placed an order for ৳4,200 via bKash. Ready for packing.",
    time: "12m ago",
    read: false,
    link: "/admin/orders"
  },
  {
    id: "n2",
    type: "STOCK",
    title: "Critical Low Stock Alert",
    description: "Oversized Heavyweight Hoodie (Black / L) has only 2 units remaining in warehouse.",
    time: "45m ago",
    read: false,
    link: "/admin/inventory"
  },
  {
    id: "n3",
    type: "SECURITY",
    title: "High Risk Order Flagged (#ORD-9198)",
    description: "Unusual shipping address velocity detected. Recommended action: verify by phone.",
    time: "2h ago",
    read: false,
    link: "/admin/risk"
  },
  {
    id: "n4",
    type: "REVIEW",
    title: "New 5-Star Review Received",
    description: "Tanvir Ahmed left a review on Minimalist Linen Shirt: 'Superb fabric drape and cut.'",
    time: "5h ago",
    read: true,
    link: "/admin/reviews"
  },
  {
    id: "n5",
    type: "ORDER",
    title: "Order Delivered (#ORD-9189)",
    description: "Steadfast Courier confirmed delivery in Dhanmondi, Dhaka. Funds deposited.",
    time: "Yesterday",
    read: true,
    link: "/admin/orders"
  }
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState("ALL");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "ALL") return true;
    return n.type === filter;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Real-time store event feeds, low stock warnings, courier tracking alerts, and notification channels
          </p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted/40 transition self-start sm:self-auto"
        >
          <Check size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Store Alerts</p>
          <p className="mt-2 text-2xl font-black text-foreground">{notifications.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Recorded in activity feed</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Unread Pending</p>
          <p className="mt-2 text-2xl font-black text-rose-600">{unreadCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Awaiting staff review</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Order Updates</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {notifications.filter((n) => n.type === "ORDER").length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Checkout and courier feeds</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Inventory &amp; Security</p>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {notifications.filter((n) => n.type === "STOCK" || n.type === "SECURITY").length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Restock and fraud alerts</p>
        </div>
      </div>

      {/* Two-Column Split: Notification Feed (Left) + Notification Preferences (Right) */}
      <div className="grid gap-8 lg:grid-cols-[2fr_1.1fr] items-start">
        {/* Left Column: Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { label: "All Alerts", value: "ALL" },
              { label: "Orders", value: "ORDER" },
              { label: "Stock Alerts", value: "STOCK" },
              { label: "Security & Risk", value: "SECURITY" },
              { label: "Reviews", value: "REVIEW" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  filter === tab.value
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((n) => {
              const Icon =
                n.type === "ORDER"
                  ? ShoppingBag
                  : n.type === "STOCK"
                  ? AlertTriangle
                  : n.type === "SECURITY"
                  ? ShieldAlert
                  : Star;

              const iconBg =
                n.type === "ORDER"
                  ? "bg-blue-50 text-blue-600"
                  : n.type === "STOCK"
                  ? "bg-amber-50 text-amber-600"
                  : n.type === "SECURITY"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600";

              return (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 shadow-sm transition-all flex items-start justify-between gap-4 ${
                    n.read
                      ? "border-border bg-background"
                      : "border-foreground/30 bg-muted/20"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 font-medium">
                        {n.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={n.link}
                      onClick={() => markRead(n.id)}
                      className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeNotification(n.id)}
                      className="rounded p-1 text-muted-foreground hover:text-rose-600 transition"
                      title="Dismiss"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Notification Preferences */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-foreground" />
            <h3 className="text-base font-bold text-foreground">Delivery Channels</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure how staff and customers receive transactional updates
          </p>

          <div className="space-y-4 divide-y divide-border/60">
            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Customer Email Confirmations</p>
                <p className="text-[11px] text-muted-foreground">Send receipt &amp; tracking info on checkout</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-foreground"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">SMS Delivery Tracking (BD)</p>
                <p className="text-[11px] text-muted-foreground">OTP on delivery and bKash transaction alerts</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-foreground"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Critical Admin Telegram / Email</p>
                <p className="text-[11px] text-muted-foreground">Immediate alerts on stockout or fraud holds</p>
              </div>
              <input
                type="checkbox"
                checked={fraudAlerts}
                onChange={(e) => setFraudAlerts(e.target.checked)}
                className="h-4 w-4 rounded accent-foreground"
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
            Powered by Resend transactional mailer &amp; Bangladeshi SMS Gateway.
          </div>
        </div>
      </div>
    </div>
  );
}
