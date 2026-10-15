"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

type Suggestion = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
};

export function SearchAutocomplete({
  placeholder = "Search for products...",
  className = ""
}: {
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestions with 300ms debounce + AbortController
  const fetchSuggestions = useCallback(async (q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(q)}`,
          { signal: abortRef.current.signal }
        );
        if (res.ok) {
          const data = await res.json() as { suggestions: Suggestion[] };
          setSuggestions(data.suggestions);
          setOpen(data.suggestions.length > 0);
          setActiveIndex(-1);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "Enter" && query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          router.push(`/products/${suggestions[activeIndex].slug}`);
          setOpen(false);
          setQuery("");
        } else if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/products/${slug}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor={`${id}-input`} className="sr-only">
          Search products
        </label>
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-9 w-full rounded-full border border-border/90 bg-muted/30 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-all"
        />
      </form>

      {/* Autocomplete dropdown */}
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
        >
          <ul className="divide-y divide-border/60">
            {suggestions.map((s, i) => (
              <li
                key={s.id}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(s.slug)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  {/* Product thumbnail */}
                  <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
                    {s.image ? (
                      <Image
                        src={s.image}
                        alt={s.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized={s.image.startsWith("/")}
                      />
                    ) : (
                      <div className="h-full w-full bg-muted/60" />
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{s.category}</p>
                  </div>
                  {/* Price */}
                  <span className="shrink-0 text-xs font-bold text-foreground">
                    {formatMoney(s.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* "See all results" footer */}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span>See all results for &ldquo;{query}&rdquo;</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      )}
    </div>
  );
}
