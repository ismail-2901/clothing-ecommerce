"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  ShieldAlert,
  Star,
  Check,
  Trash2,
  RefreshCw
} from "lucide-react";

type NotificationItem = {
  id: string;
  type: "ORDER" | "STOCK" | "SECURITY" | "REVIEW";
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
  createdAt?: string;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState(true);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch {
      // Background poll failure
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
      window.dispatchEvent(new CustomEvent("admin-notifications-refresh"));
    } catch {
      // Non-critical
    }
  };

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      window.dispatchEvent(new CustomEvent("admin-notifications-refresh"));
    } catch {
      // Non-critical
    }
  };

  const removeNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      window.dispatchEvent(new CustomEvent("admin-notifications-refresh"));
    } catch {
      // Non-critical
    }
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
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Live store event feeds, instant customer checkout alerts, low stock warnings, and courier tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchNotifications(false)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
            title="Refresh now"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted/40 transition disabled:opacity-50"
          >
            <Check size={14} />
            <span>Mark All as Read</span>
          </button>
        </div>
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
          <p className="mt-1 text-[11px] text-muted-foreground">Real-time checkout feeds</p>
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
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center space-y-2">
                <Bell size={24} className="mx-auto text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No notifications found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {filter === "ALL"
                    ? "New orders, stock warnings, and transaction activities will arrive here in real time."
                    : `No alerts matching the "${filter}" filter at this moment.`}
                </p>
              </div>
            )}

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
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  : n.type === "STOCK"
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                  : n.type === "SECURITY"
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";

              return (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 shadow-sm transition-all flex items-start justify-between gap-4 ${
                    n.read
                      ? "border-border bg-background"
                      : "border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/10"
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
                          <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
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
            Real-time feed is active · Synchronizing with PostgreSQL store events every 5 seconds.
          </div>
        </div>
      </div>
    </div>
  );
}
