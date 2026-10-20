"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { storePolicies } from "@/config/store";

const announcements = [
  `${storePolicies.shipping.freeDeliveryText} · Easy returns within ${storePolicies.returns.days} days`,
  "New Collection Live · Minimalist Essentials Designed for Every Day",
  "Cash On Delivery & Fast Nationwide Dispatch Across Bangladesh",
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);

  const prevAnnouncement = useCallback(() => {
    setCurrent((c) => (c === 0 ? announcements.length - 1 : c - 1));
  }, []);

  const nextAnnouncement = useCallback(() => {
    setCurrent((c) => (c === announcements.length - 1 ? 0 : c + 1));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const timer = setInterval(() => {
      setCurrent((c) => (c === announcements.length - 1 ? 0 : c + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="elaris-ann px-4 sm:px-8">
      <div className="container-shell flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevAnnouncement}
            className="elaris-ann-btn hidden sm:flex"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={12} />
          </button>
          <p className="elaris-ann-text line-clamp-1 text-center sm:text-left transition-opacity duration-300">
            {announcements[current]}
          </p>
          <button
            type="button"
            onClick={nextAnnouncement}
            className="elaris-ann-btn hidden sm:flex"
            aria-label="Next announcement"
          >
            <ChevronRight size={12} />
          </button>
        </div>
        <div className="hidden items-center gap-4 text-[11px] font-medium tracking-wider text-white/70 md:flex">
          <Link href="/account/orders" className="hover:text-white transition-colors">
            Track Order
          </Link>
          <span>|</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Help &amp; Support
          </Link>
        </div>
      </div>
    </div>
  );
}
