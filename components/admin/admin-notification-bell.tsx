"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Package,
  ShoppingBag,
  ShieldAlert,
  Star,
  ExternalLink,
  CheckCheck
} from "lucide-react";

export type AdminNotificationItem = {
  id: string;
  type: "ORDER" | "STOCK" | "SECURITY" | "REVIEW";
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
  createdAt: string;
};

export function AdminNotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [hasNewPulse, setHasNewPulse] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    // Skip fetching if tab is hidden
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }

    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const count = typeof data.unreadCount === "number" ? data.unreadCount : 0;
      const list: AdminNotificationItem[] = Array.isArray(data.notifications)
        ? data.notifications
        : [];

      setNotifications(list.slice(0, 6));

      setUnreadCount((prev) => {
        if (count > prev && prev !== 0) {
          setHasNewPulse(true);
          setTimeout(() => setHasNewPulse(false), 3000);
        }
        return count;
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("admin-notification-count", { detail: { unreadCount: count } })
        );
      }
    } catch {
      // Silent error in background polling
    }
  }, []);

  // Polling setup with tab visibility pause and cleanup
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active) await fetchNotifications();
    };
    void load();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
      }
    }, 30_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
      }
    };

    const handleManualRefresh = () => {
      void fetchNotifications();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("admin-notifications-refresh", handleManualRefresh);

    return () => {
      active = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("admin-notifications-refresh", handleManualRefresh);
    };
  }, [fetchNotifications]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMarkingAll(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        window.dispatchEvent(
          new CustomEvent("admin-notification-count", { detail: { unreadCount: 0 } })
        );
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleItemClick = async (notif: AdminNotificationItem) => {
    setIsOpen(false);
    if (!notif.read) {
      try {
        await fetch("/api/admin/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id })
        });
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        window.dispatchEvent(
          new CustomEvent("admin-notification-count", {
            detail: { unreadCount: Math.max(0, unreadCount - 1) }
          })
        );
      } catch {
        // Continue to navigation even if mark-as-read fails
      }
    }
    router.push(notif.link || "/admin/notifications");
  };

  const getNotificationIcon = (type: AdminNotificationItem["type"]) => {
    switch (type) {
      case "ORDER":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 shrink-0">
            <ShoppingBag size={14} />
          </div>
        );
      case "STOCK":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600 shrink-0">
            <Package size={14} />
          </div>
        );
      case "SECURITY":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-600 shrink-0">
            <ShieldAlert size={14} />
          </div>
        );
      case "REVIEW":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 shrink-0">
            <Star size={14} />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100 text-stone-600 shrink-0">
            <Bell size={14} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent hover:border-border hover:bg-stone-100 text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={unreadCount > 0 ? `${unreadCount} unread notification(s)` : "Notifications"}
      >
        <Bell
          size={18}
          className={`transition-transform ${hasNewPulse ? "animate-bounce text-foreground" : ""}`}
        />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-background transition-transform ${
              hasNewPulse ? "scale-125" : "scale-100"
            }`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modernized Notification Popover Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Admin notifications panel"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-white shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-stone-50/70">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <CheckCheck size={13} />
                <span>{isMarkingAll ? "Marking..." : "Mark all read"}</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-xs font-bold text-foreground">All caught up</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  No new operational notifications at this time.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-stone-50 ${
                    !item.read ? "bg-blue-50/25" : ""
                  }`}
                >
                  {getNotificationIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${!item.read ? "font-bold text-foreground" : "font-medium text-stone-700"}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {item.time}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/80 bg-stone-50/50 p-2 text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-foreground hover:bg-stone-100 rounded-lg transition-colors"
            >
              <span>View all notifications</span>
              <ExternalLink size={12} className="text-muted-foreground" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminNotificationNavBadge() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // NavBadge listens to CustomEvent dispatched by AdminNotificationBell — zero duplicate API calls
    const handleCount = (e: Event) => {
      const customEvent = e as CustomEvent<{ unreadCount: number }>;
      if (typeof customEvent.detail?.unreadCount === "number") {
        setUnreadCount(customEvent.detail.unreadCount);
      }
    };

    window.addEventListener("admin-notification-count", handleCount);

    return () => {
      window.removeEventListener("admin-notification-count", handleCount);
    };
  }, []);

  if (unreadCount <= 0) return null;

  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1 shadow-xs">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
