"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type VariantInput = {
  id: string;
  color: string;
  size: string;
  sku: string;
  stockQuantity: number;
  priceOverride?: number;
};

export function AdminProductForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [variants, setVariants] = useState<VariantInput[]>([
    { id: "1", color: "Black", size: "M", sku: "", stockQuantity: 10 },
    { id: "2", color: "Black", size: "L", sku: "", stockQuantity: 10 },
  ]);

  function handleNameChange(val: string) {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  }

  function addVariant() {
    const nextId = String(Date.now());
    setVariants((prev) => [
      ...prev,
      { id: nextId, color: "Black", size: "M", sku: "", stockQuantity: 5 }
    ]);
  }

  function removeVariant(id: string) {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  function updateVariant(id: string, field: keyof VariantInput, value: any) {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!basePrice || Number(basePrice) <= 0) {
      setError("Please specify a valid base price.");
      return;
    }

    setLoading(true);

    try {
      // Map base price to poisha/cents (1 BDT = 100 poisha)
      const basePricePoisha = Math.round(Number(basePrice) * 100);

      // Generate SKUs if left empty
      const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const mappedVariants = variants.map((v, i) => {
        const sku =
          v.sku.trim() ||
          `${cleanSlug.slice(0, 4).toUpperCase()}-${v.color.slice(0, 3).toUpperCase()}-${v.size.toUpperCase()}-${i + 1}`;
        return {
          sku,
          color: v.color.trim() || "Default",
          size: v.size.trim() || "Regular",
          stockQuantity: Number(v.stockQuantity) || 0,
          isAvailable: Number(v.stockQuantity) > 0,
          ...(v.priceOverride ? { priceOverride: Math.round(Number(v.priceOverride) * 100) } : {})
        };
      });

      const payload = {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        categoryId,
        basePrice: basePricePoisha,
        material: material.trim() || undefined,
        careInstructions: careInstructions.trim() || undefined,
        status,
        tags: [name.toLowerCase(), status.toLowerCase()],
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        variants: mappedVariants
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create product. Check that the slug and SKUs are unique.");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error occurred while saving product.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Main fields */}
      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Product details</h2>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="product-name" className="text-sm font-medium">Name *</label>
              <input
                id="product-name"
                type="text"
                required
                placeholder="e.g. Structured Cotton Blazer"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="product-slug" className="text-sm font-medium">Slug *</label>
              <input
                id="product-slug"
                type="text"
                required
                placeholder="structured-cotton-blazer"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              />
              <p className="text-xs text-muted-foreground">Store URL: /products/{slug || "[slug]"}</p>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="product-description" className="text-sm font-medium">Description *</label>
              <textarea
                id="product-description"
                rows={4}
                required
                placeholder="Crafted from premium heavy cotton with a relaxed silhouette and clean horn buttons."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-y rounded-md border border-border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              />
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="product-material" className="text-sm font-medium">Material</label>
                <input
                  id="product-material"
                  type="text"
                  placeholder="100% Organic Cotton"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="product-care" className="text-sm font-medium">Care instructions</label>
                <input
                  id="product-care"
                  type="text"
                  placeholder="Dry clean only"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Variants & Stock</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Set up sizes, colors, and initial inventory quantities.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus size={14} /> Add variant
            </Button>
          </div>

          <div className="mt-4 grid gap-3">
            {variants.map((v) => (
              <div key={v.id} className="grid items-end gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_1fr_1fr_90px_40px]">
                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Black"
                    value={v.color}
                    onChange={(e) => updateVariant(v.id, "color", e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Size</label>
                  <input
                    type="text"
                    placeholder="e.g. M, L, 32"
                    value={v.size}
                    onChange={(e) => updateVariant(v.id, "size", e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">SKU (optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={v.sku}
                    onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 font-mono text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={v.stockQuantity}
                    onChange={(e) => updateVariant(v.id, "stockQuantity", parseInt(e.target.value) || 0)}
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    disabled={variants.length <= 1}
                    onClick={() => removeVariant(v.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-danger disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-danger/20 bg-danger/10 p-4 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Save & Publish Product"}
          </Button>
          <Button asChild type="button" variant="outline" size="lg">
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="grid gap-6 self-start lg:sticky lg:top-8">
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Status</h2>
          <div className="mt-4">
            <select
              id="product-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "PUBLISHED" | "DRAFT")}
              className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none"
            >
              <option value="PUBLISHED">Published (Visible on storefront)</option>
              <option value="DRAFT">Draft (Hidden from customers)</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Category & Pricing</h2>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="product-category" className="text-sm font-medium">Category *</label>
              <select
                id="product-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="base-price" className="text-sm font-medium">Base Price (BDT) *</label>
              <input
                id="base-price"
                type="number"
                required
                min="1"
                step="1"
                placeholder="2450"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm font-medium focus-visible:outline-none"
              />
              <p className="text-xs text-muted-foreground">Price in Taka (৳)</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Product Image</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Provide a direct image URL (Unsplash, Cloudinary, etc.) for the product photo.
          </p>
          <div className="mt-3">
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-4 text-xs focus-visible:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
