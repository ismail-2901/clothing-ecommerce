"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, LayoutGrid, X } from "lucide-react";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      setShowAddModal(false);
      setLoading(false);
      router.refresh();
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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product collections and department taxonomy
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Category</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-4 grid gap-4">
              {error && (
                <div className="rounded border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linen Shirts"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="linen-shirts"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                  className="h-10 rounded-md border border-border bg-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://... or /images/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {initialCategories.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <LayoutGrid size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No categories defined</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Categories are required so customers can filter clothing items by section.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="mt-4">
            <Plus size={16} /> Add First Category
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Name", "Slug", "Description", "Products", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialCategories.map((c) => (
                <tr key={c.id} className="bg-background hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{c.name}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    /{c.slug}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                    {c.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="muted">{c._count.products} products</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={deletingId === c.id || c._count.products > 0}
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-danger disabled:opacity-30"
                      title={c._count.products > 0 ? "Cannot delete category with products" : "Delete category"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
