"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="elaris-ann">
      <button type="button" className="elaris-ann-btn" aria-label="Previous announcement">
        <ChevronLeft size={12} />
      </button>
      <p className="elaris-ann-text">
        Free shipping on orders over ৳3000&nbsp;&nbsp;|&nbsp;&nbsp;New collection live now
      </p>
      <button type="button" className="elaris-ann-btn" aria-label="Next announcement">
        <ChevronRight size={12} />
      </button>
    </div>
  );
}
