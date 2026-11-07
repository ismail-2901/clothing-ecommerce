"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  LayoutGrid,
  Search,
  FolderTree,
  Sparkles,
  Layers,
  ArrowRight,
  Edit2,
  X,
  Check,
  ExternalLink,
  ChevronRight,
  Folder,
  FolderOpen,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    _count: { products: number };
  }>;
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

  // Create form state
  const [parentId, setParentId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleCreateNameChange(val: string) {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);
    setIsCreating(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          parentId: parentId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create category.");
        setIsCreating(false);
        return;
      }

      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setParentId("");
      setCreateSuccess(true);
      setIsCreating(false);
      router.refresh();
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch {
      setCreateError("Network error occurred.");
      setIsCreating(false);
    }
  }

  function startEdit(cat: CategoryItem) {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || "");
    setEditImageUrl(cat.imageUrl || "");
    setEditParentId(cat.parentId || "");
    setEditError(null);
  }

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    setEditError(null);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim(),
          description: editDescription.trim() || null,
          imageUrl: editImageUrl.trim() || null,
          parentId: editParentId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update category.");
        setIsUpdating(false);
        return;
      }

      setEditingCategory(null);
      setIsUpdating(false);
      router.refresh();
    } catch {
      setEditError("Network error occurred.");
      setIsUpdating(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingCategory) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete category.");
        setIsDeleting(false);
        return;
      }

      setDeletingCategory(null);
      setIsDeleting(false);
      router.refresh();
    } catch {
      alert("Network error occurred.");
      setIsDeleting(false);
    }
  }

  const totalProducts = initialCategories.reduce((sum, c) => sum + c._count.products, 0);

  // Group into Top-Level Categories with nested children
  const topLevelCategories = initialCategories.filter((c) => !c.parentId);

  // Search filtering
  const filteredTopLevel = topLevelCategories.filter((parent) => {
    const parentMatches =
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const children = initialCategories.filter((c) => c.parentId === parent.id);
    const childrenMatch = children.some(
      (child) =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return parentMatches || childrenMatch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Categories &amp; Taxonomy
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground dark:text-white">
              {initialCategories.length} Categories
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Structure two-tier catalog navigation, manage subcategories, and inspect product associations
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Top-Level Sections</p>
          <p className="mt-2 text-2xl font-black text-foreground">{topLevelCategories.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Primary store divisions</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Subcategories</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {initialCategories.length - topLevelCategories.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Nested garment types</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Products Mapped</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalProducts}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Active catalog pieces</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Largest Category</p>
          <p className="mt-2 text-lg font-bold text-foreground truncate">
            {initialCategories.reduce((max, c) => (c._count.products > (max?._count.products || 0) ? c : max), initialCategories[0])?.name || "None"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Top volume department</p>
        </div>
      </div>

      {/* Two-Column Split: Two-Tier Category Hierarchy (Left) + Add New Form (Right) */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1.6fr_1fr] items-start">
        {/* Left Column: Categories Hierarchy Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5 shadow-sm">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search category name, subcategory, or slug…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {filteredTopLevel.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
              <LayoutGrid size={36} className="text-muted-foreground mb-3" />
              <h2 className="text-base font-bold text-foreground">No categories match your search</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching with another keyword or create a new category using the form on the right.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm divide-y divide-border/60">
              {filteredTopLevel.map((parent) => {
                const children = initialCategories.filter((c) => c.parentId === parent.id);

                return (
                  <div key={parent.id} className="p-4 space-y-3">
                    {/* Parent Category Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-md bg-foreground/10 p-1.5 text-foreground">
                          <Folder size={15} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              {parent.name}
                            </span>
                            <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                              Top-Level
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            /{parent.slug}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products?category=${parent.id}`}
                          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-bold text-foreground hover:bg-muted/80 transition"
                          title="View products in this category"
                        >
                          <span>{parent._count.products} products</span>
                          <ExternalLink size={11} className="text-muted-foreground" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => startEdit(parent)}
                          className="rounded p-1 text-muted-foreground hover:text-foreground transition"
                          title="Edit Category"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          disabled={parent._count.products > 0 || children.length > 0}
                          onClick={() => setDeletingCategory(parent)}
                          className="rounded p-1 text-muted-foreground hover:text-rose-600 disabled:opacity-30 transition"
                          title={
                            parent._count.products > 0
                              ? "Cannot delete category with active products"
                              : children.length > 0
                              ? "Cannot delete category with active subcategories"
                              : "Delete Category"
                          }
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories Nested List */}
                    {children.length > 0 && (
                      <div className="ml-7 pl-3 border-l-2 border-border/80 space-y-2 pt-1">
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-xs border border-border/50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {child.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                /{child.slug}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/products?category=${child.id}`}
                                className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground hover:bg-muted/80 transition"
                                title="View products in subcategory"
                              >
                                <span>{child._count.products} products</span>
                                <ExternalLink size={10} className="text-muted-foreground" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => startEdit(child)}
                                className="rounded p-1 text-muted-foreground hover:text-foreground transition"
                                title="Edit Subcategory"
                              >
                                <Edit2 size={12} />
                              </button>

                              <button
                                type="button"
                                disabled={child._count.products > 0}
                                onClick={() => setDeletingCategory(child)}
                                className="rounded p-1 text-muted-foreground hover:text-rose-600 disabled:opacity-30 transition"
                                title={
                                  child._count.products > 0
                                    ? "Cannot delete subcategory with active products"
                                    : "Delete Subcategory"
                                }
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Inline Add New Category Card Form */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm lg:sticky lg:top-6 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-foreground" />
              <h2 className="text-base font-bold text-foreground">Add New Category</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a top-level department or subcategory
            </p>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            {createError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                Category created successfully!
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Parent Category (Optional)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="">None (Top-Level Category)</option>
                {topLevelCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Leave empty for top-level division (e.g. Men, Women), or choose parent for subcategory.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Linen Shirts"
                value={name}
                onChange={(e) => handleCreateNameChange(e.target.value)}
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
              disabled={isCreating || !name.trim()}
              className="w-full text-xs font-bold h-9 mt-2"
            >
              {isCreating ? <Spinner size="sm" /> : "+ Create Category"}
            </Button>
          </form>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  Edit Category: {editingCategory.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Update name, slug, or descriptive information
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              {editError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {editError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Image URL</label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  disabled={isUpdating}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition shadow-xs"
                >
                  {isUpdating ? <Spinner size="sm" /> : <Check size={13} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-rose-50 p-2 text-rose-600 border border-rose-200">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Delete Category</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Are you sure you want to delete category{" "}
                  <strong className="text-zinc-900">&quot;{deletingCategory.name}&quot;</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              This category has {deletingCategory._count.products} assigned products.
              Cascade deletion protection is strictly enforced.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-xs"
              >
                {isDeleting ? <Spinner size="sm" /> : <Trash2 size={13} />}
                <span>Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
