"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function AdminHeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 640) {
          setIsMobileOpen(true);
        } else {
          desktopInputRef.current?.focus();
          desktopInputRef.current?.select();
        }
      } else if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  // Autofocus mobile input when opened
  useEffect(() => {
    if (isMobileOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [isMobileOpen]);

  const executeSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    if (term.toLowerCase().startsWith("ord") || /^#?\d+$/.test(term)) {
      router.push(`/admin/orders?q=${encodeURIComponent(term)}`);
    } else if (term.toLowerCase().startsWith("cust") || term.includes("@")) {
      router.push(`/admin/customers?q=${encodeURIComponent(term)}`);
    } else {
      router.push(`/admin/products?q=${encodeURIComponent(term)}`);
    }
    setIsMobileOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <>
      {/* Desktop Search Input */}
      <form onSubmit={handleSubmit} className="relative hidden sm:block w-64 md:w-80 lg:w-96 group">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none"
        />
        <input
          ref={desktopInputRef}
          type="text"
          aria-label="Search products, orders, customers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, orders, customers..."
          className="h-9 w-full rounded-lg border border-border/80 bg-stone-50/60 pl-9 pr-14 text-xs font-medium text-foreground placeholder:text-muted-foreground/80 hover:bg-stone-50 focus:border-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all shadow-2xs"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              desktopInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        ) : (
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs">
            ⌘K
          </kbd>
        )}
      </form>

      {/* Mobile Search Trigger Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        aria-label="Open search dialog"
      >
        <Search size={18} />
      </button>

      {/* Mobile Search Modal Overlay */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin search"
          className="fixed inset-0 z-[100] sm:hidden flex flex-col bg-background/95 backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <form onSubmit={handleSubmit} className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                ref={mobileInputRef}
                type="text"
                aria-label="Search products, orders, customers"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders (#1001), customers (@), products..."
                className="h-10 w-full rounded-lg border border-border bg-stone-50 pl-9 pr-9 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none shadow-2xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Clear query"
                >
                  <X size={15} />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-2"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Quick Routing Shortcuts
            </p>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => executeSearch("orders")}
                className="w-full text-left px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200/70 text-foreground font-medium flex items-center justify-between"
              >
                <span>Type <strong className="font-semibold text-foreground">ord</strong> to jump to Orders</span>
                <span className="text-[10px] text-muted-foreground font-mono">/admin/orders</span>
              </button>
              <button
                type="button"
                onClick={() => executeSearch("customers")}
                className="w-full text-left px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200/70 text-foreground font-medium flex items-center justify-between"
              >
                <span>Type <strong className="font-semibold text-foreground">@</strong> to jump to Customers</span>
                <span className="text-[10px] text-muted-foreground font-mono">/admin/customers</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
