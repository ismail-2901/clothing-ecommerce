"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

// One row = one color with multiple sizes
type VariantGroup = {
  id: string;
  color: string;
  sizes: string[];        // multiple sizes toggled
  sku: string;            // prefix; auto-suffixed per size
  stockQuantity: number;  // stock applied per size
  priceOverride?: number;
};

export type ProductFormInitialData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;   // in poisha
  material?: string | null;
  careInstructions?: string | null;
  status: "PUBLISHED" | "DRAFT";
  imageUrl?: string | null;
  variantGroups: VariantGroup[];
};

const SIZE_GROUPS: Record<string, string[]> = {
  Alpha: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
  "Numeric (Waist)": ["28", "30", "32", "34", "36", "38", "40", "42"],
  Shoe: ["EU38", "EU39", "EU40", "EU41", "EU42", "EU43", "EU44", "EU45"],
  Other: ["One Size", "Free Size"],
};
const ALL_SIZES = Object.values(SIZE_GROUPS).flat();

function SizeToggle({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (sizes: string[]) => void;
}) {
  // Sanitize: split any legacy comma strings and remove duplicates
  const cleanSelected = [
    ...new Set(
      selected
        .flatMap((s) => (s ? s.split(",") : []))
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];

  function toggle(s: string) {
    const next = cleanSelected.includes(s)
      ? cleanSelected.filter((x) => x !== s)
      : [...cleanSelected, s];
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {ALL_SIZES.map((s) => {
        const active = cleanSelected.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

export function AdminProductForm({
  categories,
  initialData,
}: {
  categories: CategoryOption[];
  initialData?: ProductFormInitialData;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId ?? categories[0]?.id ?? ""
  );
  const [basePrice, setBasePrice] = useState<number | "">(
    initialData ? Math.round(initialData.basePrice / 100) : ""
  );
  const [material, setMaterial] = useState(initialData?.material ?? "");
  const [careInstructions, setCareInstructions] = useState(
    initialData?.careInstructions ?? ""
  );
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">(
    initialData?.status ?? "PUBLISHED"
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<VariantGroup[]>(
    initialData?.variantGroups?.map((g) => ({
      ...g,
      sizes: [
        ...new Set(
          g.sizes
            .flatMap((s) => (s ? s.split(",") : []))
            .map((s) => s.trim())
            .filter(Boolean)
        ),
      ],
    })) ?? [
      { id: "1", color: "", sizes: [], sku: "", stockQuantity: 10 },
    ]
  );

  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit) {
      setSlug(
        val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      );
    }
  }

  function addGroup() {
    setGroups((prev) => [
      ...prev,
      { id: String(Date.now()), color: "", sizes: [], sku: "", stockQuantity: 10 },
    ]);
  }

  function removeGroup(id: string) {
    if (groups.length <= 1) return;
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  function updateGroup(id: string, field: keyof VariantGroup, value: unknown) {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImageUrl(null);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!categoryId) { setError("Please select a category."); return; }
    if (!basePrice || Number(basePrice) <= 0) { setError("Please specify a valid base price."); return; }
    if (groups.some((g) => g.sizes.length === 0)) {
      setError("Each color variant must have at least one size selected.");
      return;
    }

    setLoading(true);

    let uploadedUrl = existingImageUrl ?? "";
    if (imageFile) {
      setImageUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", imageFile);
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!upRes.ok) {
          const upErr = await upRes.json().catch(() => ({}));
          setError(upErr.error || "Image upload failed.");
          setLoading(false);
          setImageUploading(false);
          return;
        }
        uploadedUrl = (await upRes.json()).url;
      } catch {
        setError("Network error during image upload.");
        setLoading(false);
        setImageUploading(false);
        return;
      } finally {
        setImageUploading(false);
      }
    }

    try {
      const basePricePoisha = Math.round(Number(basePrice) * 100);
      const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Expand each color group → one DB variant per size (strictly unique per color)
      const mappedVariants = groups.flatMap((g, gi) => {
        const cleanColor = g.color.trim() || "Default";
        const cleanSizes = [
          ...new Set(
            g.sizes
              .flatMap((s) => (s ? s.split(",") : []))
              .map((s) => s.trim())
              .filter(Boolean)
          ),
        ];

        return cleanSizes.map((size, si) => {
          const sku =
            g.sku.trim()
              ? `${g.sku.trim()}-${size}`
              : `${cleanSlug.slice(0, 4).toUpperCase()}-${cleanColor.slice(0, 3).toUpperCase()}-${size}-${gi + 1}${si + 1}`;
          return {
            sku,
            color: cleanColor,
            size,
            stockQuantity: Number(g.stockQuantity) || 0,
            isAvailable: Number(g.stockQuantity) > 0,
            ...(g.priceOverride
              ? { priceOverride: Math.round(Number(g.priceOverride) * 100) }
              : {}),
          };
        });
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
        images: uploadedUrl ? [uploadedUrl] : [],
        variants: mappedVariants,
      };

      const url = isEdit
        ? `/api/admin/products/${initialData!.id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save product. Check slug and SKUs are unique.");
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
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))
                }
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              />
              <p className="text-xs text-muted-foreground">
                Store URL: /products/{slug || "[slug]"}
              </p>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="product-description" className="text-sm font-medium">Description *</label>
              <textarea
                id="product-description"
                rows={4}
                required
                placeholder="Crafted from premium heavy cotton with a relaxed silhouette."
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

        {/* Color variant groups */}
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Color Variants & Sizes</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                One row per color — click size buttons to toggle availability.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addGroup}>
              <Plus size={14} /> Add color
            </Button>
          </div>

          <div className="mt-4 grid gap-4">
            {groups.map((g) => (
              <div
                key={g.id}
                className="grid gap-3 rounded-md border border-border p-4"
              >
                {/* Top inputs row */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="grid gap-1 min-w-[120px] flex-1">
                    <label className="text-xs text-muted-foreground">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Black"
                      value={g.color}
                      onChange={(e) => updateGroup(g.id, "color", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
                    />
                  </div>
                  <div className="grid gap-1 w-24">
                    <label className="text-xs text-muted-foreground">Stock/size</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="10"
                      value={g.stockQuantity}
                      onChange={(e) =>
                        updateGroup(g.id, "stockQuantity", parseInt(e.target.value) || 0)
                      }
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"
                    />
                  </div>
                  <div className="grid gap-1 min-w-[120px] flex-1">
                    <label className="text-xs text-muted-foreground">SKU prefix (optional)</label>
                    <input
                      type="text"
                      placeholder="Auto-generated"
                      value={g.sku}
                      onChange={(e) => updateGroup(g.id, "sku", e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 font-mono text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={groups.length <= 1}
                    onClick={() => removeGroup(g.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-danger disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Size toggles */}
                <div className="grid gap-1.5">
                  <label className="text-xs text-muted-foreground">
                    Sizes{" "}
                    {g.sizes.length > 0 && (
                      <span className="font-medium text-foreground">
                        — {g.sizes.join(", ")}
                      </span>
                    )}
                  </label>
                  <SizeToggle
                    selected={g.sizes}
                    onChange={(sizes) => updateGroup(g.id, "sizes", sizes)}
                  />
                  {g.sizes.length === 0 && (
                    <p className="text-xs text-danger">Select at least one size.</p>
                  )}
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
            {loading ? (
              <Spinner size="sm" />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Save & Publish Product"
            )}
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
                onChange={(e) =>
                  setBasePrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm font-medium focus-visible:outline-none"
              />
              <p className="text-xs text-muted-foreground">Price in Taka (৳)</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Product Image</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a photo from your device — saved to Cloudinary automatically.
          </p>
          <div className="mt-3">
            <input
              ref={fileInputRef}
              id="product-image-file"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-48 w-full rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 border border-border text-muted-foreground hover:text-danger"
                >
                  <X size={12} />
                </button>
                {imageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <UploadCloud size={22} />
                <span className="text-xs font-medium">Click to upload image</span>
                <span className="text-[11px]">PNG, JPG, WEBP up to 10 MB</span>
              </button>
            )}

            <div className="mt-3 pt-3 border-t border-border">
              <label htmlFor="product-image-url" className="text-xs text-muted-foreground">
                Or paste image URL directly
              </label>
              <input
                id="product-image-url"
                type="text"
                placeholder="https://... or /images/..."
                value={existingImageUrl ?? ""}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setExistingImageUrl(val || null);
                  setImagePreview(val || null);
                  setImageFile(null);
                }}
                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus-visible:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
