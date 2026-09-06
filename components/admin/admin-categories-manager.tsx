"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  LayoutGrid,
  Search,
  FolderTree,
  Sparkles,
  Layers,
  ArrowRight,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    products: number;
  };
};

export function AdminCategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create category.");
        setLoading(false);
        return;
      }

      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setSuccess(true);
      setLoading(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error occurred.");
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete category.");
        setDeletingId(null);
        return;
      }

      router.refresh();
    } catch {
      alert("Network error occurred.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalProducts = initialCategories.reduce((sum, c) => sum + c._count.products, 0);
  const filteredCategories = initialCategories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Categories &amp; Taxonomy
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {initialCategories.length} Collections
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Structure your store catalog navigation, collection landing pages, and menu hierarchies
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Categories</p>
          <p className="mt-2 text-2xl font-black text-foreground">{initialCategories.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Active storefront sections</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Products Mapped</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalProducts}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Assigned across categories</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Avg Products / Category</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {initialCategories.length > 0 ? (totalProducts / initialCategories.length).toFixed(1) : 0}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Catalog balance metric</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Largest Collection</p>
          <p className="mt-2 text-lg font-bold text-foreground truncate">
            {initialCategories.reduce((max, c) => (c._count.products > (max?._count.products || 0) ? c : max), initialCategories[0])?.name || "None"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Top volume category</p>
        </div>
      </div>

      {/* Two-Column Split: Categories Table (Left) + Add New Form (Right) */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] items-start">
        {/* Left Column: Categories List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5 shadow-sm">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search category name or slug…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
              <LayoutGrid size={36} className="text-muted-foreground mb-3" />
              <h2 className="text-base font-bold text-foreground">No categories match your search</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching with another keyword or create a new category using the form on the right.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4 text-center">Products</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <div>
                          <p className="text-foreground">{c.name}</p>
                          {c.description && (
                            <p className="text-[11px] font-normal text-muted-foreground line-clamp-1">
                              {c.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        /{c.slug}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                          {c._count.products}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={deletingId === c.id || c._count.products > 0}
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-rose-600 hover:border-rose-200 disabled:opacity-30 transition"
                          title={c._count.products > 0 ? "Cannot delete category with active products" : "Delete category"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Inline Add New Category Card Form */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm sticky top-6">
          <div className="flex items-center gap-2 mb-1">
            <Plus size={16} className="text-foreground" />
            <h2 className="text-base font-bold text-foreground">Add New Category</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Create a product collection for customer browsing
          </p>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                Category created successfully!
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Linen Shirts"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="linen-shirts"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Brief summary of this clothing collection…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Cover Image URL (Optional)</label>
              <input
                type="text"
                placeholder="https://... or /images/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full text-xs font-bold h-9 mt-2"
            >
              {loading ? <Spinner size="sm" /> : "+ Create Category"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
