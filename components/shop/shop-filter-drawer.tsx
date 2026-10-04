"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";

/**
 * Mobile drawer wrapper for ShopFilters.
 * On lg+ the filters are shown inline in the sidebar.
 * On < lg a FAB-style trigger opens a full-height drawer.
 */
export function ShopFilterDrawer({
  children,
  activeFilterCount,
}: {
  children: React.ReactNode;
  activeFilterCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const drawerContent = (
    <div
      className={`fixed inset-0 z-[200] lg:hidden transition-[visibility] duration-300 ${
        open ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <aside
        id="shop-filter-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
        className={`fixed inset-y-0 left-0 z-[201] w-[min(320px,90vw)] h-[100dvh] overflow-y-auto overscroll-contain bg-background border-r border-border shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} />
            <span className="text-sm font-bold text-foreground">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-bold text-background">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter content */}
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );

  return (
    <>
      {/* Mobile trigger button — only visible below lg */}
      <button
        id="shop-filter-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="shop-filter-drawer"
        className="flex lg:hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors active:scale-95 shrink-0"
      >
        <SlidersHorizontal size={14} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Portal drawer */}
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
