"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="elaris-ann px-4 sm:px-8">
      <div className="container-shell flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className="elaris-ann-btn hidden sm:flex" aria-label="Previous announcement">
            <ChevronLeft size={12} />
          </button>
          <p className="elaris-ann-text">
            Free delivery on orders over ৳3000&nbsp;&nbsp;|&nbsp;&nbsp;Easy return within 7 days&nbsp;&nbsp;|&nbsp;&nbsp;New collection now live
          </p>
          <button type="button" className="elaris-ann-btn hidden sm:flex" aria-label="Next announcement">
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
