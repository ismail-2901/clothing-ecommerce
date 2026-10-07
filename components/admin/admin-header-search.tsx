"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function AdminHeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;

    if (term.toLowerCase().startsWith("ord") || /^#?\d+$/.test(term)) {
      router.push(`/admin/orders?q=${encodeURIComponent(term)}`);
    } else if (term.toLowerCase().startsWith("cust") || term.includes("@")) {
      router.push(`/admin/customers?q=${encodeURIComponent(term)}`);
    } else {
      router.push(`/admin/products?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative hidden sm:block w-64 lg:w-96">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        aria-label="Search products, orders, customers"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, orders, customers..."
        className="h-9 w-full rounded-md border border-border/80 bg-muted/30 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-all"
      />
    </form>
  );
}
