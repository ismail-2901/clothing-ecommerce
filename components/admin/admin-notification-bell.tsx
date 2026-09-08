"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function AdminNotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasNewPulse, setHasNewPulse] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const count = typeof data.unreadCount === "number" ? data.unreadCount : 0;

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

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);

    const handleRefresh = () => fetchUnread();
    window.addEventListener("admin-notifications-refresh", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("admin-notifications-refresh", handleRefresh);
    };
  }, [fetchUnread]);

  return (
    <Link
      href="/admin/notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Notifications"
      title={unreadCount > 0 ? `${unreadCount} unread notification(s)` : "Notifications"}
    >
      <Bell size={18} className={hasNewPulse ? "animate-bounce text-foreground" : ""} />
      {unreadCount > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background transition-transform ${
            hasNewPulse ? "scale-125" : "scale-100"
          }`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

export function AdminNotificationNavBadge() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const handleCount = (e: Event) => {
      const customEvent = e as CustomEvent<{ unreadCount: number }>;
      if (typeof customEvent.detail?.unreadCount === "number") {
        setUnreadCount(customEvent.detail.unreadCount);
      }
    };

    window.addEventListener("admin-notification-count", handleCount);

    // Initial check
    fetch("/api/admin/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => undefined);

    const interval = setInterval(() => {
      fetch("/api/admin/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => undefined);
    }, 5000);

    return () => {
      window.removeEventListener("admin-notification-count", handleCount);
      clearInterval(interval);
    };
  }, []);

  if (unreadCount <= 0) return null;

  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1 shadow-sm">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
