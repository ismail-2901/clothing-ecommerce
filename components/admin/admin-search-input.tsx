"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTransition, useState, useEffect } from "react";

export function AdminSearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(currentQ);

  useEffect(() => {
    setValue(currentQ);
  }, [currentQ]);

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set("q", term.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(value);
      }}
      className="mt-6 flex items-center gap-2 rounded-md border border-border bg-background px-4"
    >
      <Search
        size={16}
        className={`shrink-0 ${isPending ? "animate-pulse text-foreground" : "text-muted-foreground"}`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            handleSearch("");
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
