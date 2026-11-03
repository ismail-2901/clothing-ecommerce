"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { storePolicies } from "@/config/store";

const announcements = [
  {
    text: `${storePolicies.shipping.freeDeliveryText} · Easy returns within ${storePolicies.returns.days} days`,
    tag: "Complimentary Delivery"
  },
  {
    text: "New Season '25 Live · Minimalist Architecture & Breathable Textiles",
    tag: "New Capsule"
  },
  {
    text: "Cash On Delivery & Fast Nationwide Dispatch Across Bangladesh",
    tag: "Direct to Door"
  }
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

  const active = announcements[current];

  return (
    <aside
      className="relative z-50 border-b border-stone-800 bg-[#1c1917] text-stone-200 transition-colors"
      aria-label="Announcements & Store Services"
    >
      <div className="container-shell flex h-9 items-center justify-between text-[11px]">
        {/* Left & Center: Cycling promotional announcements */}
        <div className="flex flex-1 items-center justify-center sm:justify-start gap-2 min-w-0">
          <button
            type="button"
            onClick={prevAnnouncement}
            className="hidden sm:inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={13} />
          </button>

          <div className="flex items-center gap-2 overflow-hidden px-1">
            <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] font-semibold text-amber-300 uppercase tracking-widest">
              <Sparkles size={10} className="text-amber-400" />
              {active.tag}
            </span>
            <p className="truncate font-medium tracking-[0.1em] text-stone-300 uppercase text-center sm:text-left transition-opacity duration-300">
              {active.text}
            </p>
          </div>

          <button
            type="button"
            onClick={nextAnnouncement}
            className="hidden sm:inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Right: Curated utility links with subtle champagne gold hover */}
        <div className="hidden md:flex items-center gap-5 text-[11px] font-medium uppercase tracking-[0.12em] text-stone-400 shrink-0">
          <Link
            href="/account/orders"
            className="hover:text-amber-300 transition-colors duration-150"
          >
            Track Order
          </Link>
          <span className="text-stone-700" aria-hidden="true">|</span>
          <Link
            href="/contact"
            className="hover:text-amber-300 transition-colors duration-150"
          >
            Client Services
          </Link>
        </div>
      </div>
    </aside>
  );
}
