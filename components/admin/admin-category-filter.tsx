"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Filter } from "lucide-react";

type CategoryFilterOption = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Array<{ id: string; name: string }>;
};

export function AdminCategoryFilter({
  categories,
}: {
  categories: CategoryFilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "";

  const topLevel = categories.filter((c) => !c.parentId);

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative flex items-center">
      <select
        id="admin-category-filter"
        value={currentCategory}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="h-11 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted/20 focus-visible:outline-none"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {topLevel.map((cat) => (
          <optgroup key={cat.id} label={cat.name}>
            <option value={cat.id}>{cat.name} (All)</option>
            {cat.children?.map((sub) => (
              <option key={sub.id} value={sub.id}>
                &nbsp;&nbsp;↳ {sub.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
