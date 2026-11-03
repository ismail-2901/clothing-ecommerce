"use client";

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Trash2,
  UploadCloud,
  X,
  Sparkles,
  Layers,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowLeft,
  Info,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatMoney } from "@/lib/utils/money";

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  children?: Array<{ id: string; name: string; slug: string }>;
};

// One row = one color with multiple sizes
export type VariantGroup = {
  id: string;
  color: string;
  sizes: string[];        // multiple sizes toggled
  sku: string;            // prefix; auto-suffixed per size
  stockQuantity: number;  // stock applied per size
  priceOverride?: number; // in Taka for admin form
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

const SIZE_CATEGORIES: Record<string, string[]> = {
  "Alpha Sizing": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
  "Waist / Bottoms": ["28", "30", "32", "34", "36", "38", "40", "42"],
  "Footwear": ["EU38", "EU39", "EU40", "EU41", "EU42", "EU43", "EU44", "EU45"],
  "Universal": ["One Size", "Free Size"],
};

function SizeToggleGroup({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (sizes: string[]) => void;
}) {
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
    <div className="space-y-3">
      {Object.entries(SIZE_CATEGORIES).map(([categoryName, sizes]) => (
        <div key={categoryName} className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {categoryName}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const active = cleanSelected.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "border-foreground bg-foreground text-background shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      ))}
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
  const [isSlugManual, setIsSlugManual] = useState(isEdit);
  const [description, setDescription] = useState(initialData?.description ?? "");

  const topLevelCategories = categories.filter((c) => !c.parentId);
  const initialCategoryObj = categories.find((c) => c.id === initialData?.categoryId);
  const initialParentId =
    initialCategoryObj?.parentId ||
    (initialCategoryObj ? initialCategoryObj.id : (topLevelCategories[0]?.id ?? categories[0]?.id ?? ""));
  const initialSubId = initialCategoryObj?.parentId ? initialCategoryObj.id : "";

  const [parentCategoryId, setParentCategoryId] = useState<string>(initialParentId);
  const [subcategoryId, setSubcategoryId] = useState<string>(initialSubId);
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
  const [isDirty, setIsDirty] = useState(false);

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
      priceOverride: g.priceOverride ? Math.round(g.priceOverride / 100) : undefined
    })) ?? [
      { id: "1", color: "Black", sizes: ["M", "L"], sku: "", stockQuantity: 10 },
    ]
  );

  // Unsaved changes warning
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && !loading) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, loading]);

  function handleNameChange(val: string) {
    setName(val);
    setIsDirty(true);
    if (!isSlugManual) {
      setSlug(
        val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      );
    }
  }

  function handleSlugChange(val: string) {
    setIsSlugManual(true);
    setIsDirty(true);
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]+/g, ""));
  }

  function handleParentCategoryChange(parentId: string) {
    setParentCategoryId(parentId);
    setSubcategoryId("");
    setIsDirty(true);
  }

  const selectedParentCategory = categories.find((c) => c.id === parentCategoryId);
  const availableSubcategories = categories.filter((c) => c.parentId === parentCategoryId);

  function addGroup() {
    setIsDirty(true);
    setGroups((prev) => [
      ...prev,
      { id: String(Date.now()), color: "", sizes: [], sku: "", stockQuantity: 10 },
    ]);
  }

  function removeGroup(id: string) {
    if (groups.length <= 1) return;
    setIsDirty(true);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  function updateGroup(id: string, field: keyof VariantGroup, value: unknown) {
    setIsDirty(true);
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDirty(true);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImageUrl(null);
  }

  function clearImage() {
    setIsDirty(true);
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Computed generated matrix summary
  const totalVariants = groups.reduce((acc, g) => acc + g.sizes.length, 0);
  const totalStockUnits = groups.reduce(
    (acc, g) => acc + (Number(g.stockQuantity) || 0) * g.sizes.length,
    0
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const effectiveCategoryId = subcategoryId || parentCategoryId;
    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }
    if (!slug.trim()) {
      setError("Please specify a URL slug.");
      return;
    }
    if (!effectiveCategoryId) {
      setError("Please select a primary category.");
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      setError("Please specify a valid base price in BDT.");
      return;
    }
    if (groups.length === 0 || groups.some((g) => g.sizes.length === 0)) {
      setError("Each color grouping must have at least one size variant selected.");
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
          setError(upErr.error || "Image upload to Cloudinary failed.");
          setLoading(false);
          setImageUploading(false);
          return;
        }
        uploadedUrl = (await upRes.json()).url;
      } catch {
        setError("Network error during Cloudinary image upload.");
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

      // Expand each color group → one DB variant per size
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
            ...(g.priceOverride && Number(g.priceOverride) > 0
              ? { priceOverride: Math.round(Number(g.priceOverride) * 100) }
              : {}),
          };
        });
      });

      const payload = {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        categoryId: effectiveCategoryId,
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
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Failed to ${isEdit ? "update" : "create"} product.`);
        return;
      }

      setIsDirty(false);
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-5xl">
      {/* Top Banner Alert for Errors */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-xs">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Form Submission Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid: 2 Columns for Sections */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Primary Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sparkles size={16} className="text-foreground" />
              <h2 className="text-sm font-bold text-foreground">Basic Information</h2>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Product Name *</label>
                <span className="text-[11px] text-muted-foreground">{name.length}/200</span>
              </div>
              <input
                type="text"
                required
                maxLength={200}
                placeholder="e.g. Classic Linen Cuban Collar Shirt"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">URL Slug *</label>
              <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-foreground">
                <span className="bg-muted px-3 py-2 text-xs text-muted-foreground font-mono select-none">
                  /products/
                </span>
                <input
                  type="text"
                  required
                  placeholder="classic-linen-cuban-collar-shirt"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="h-10 w-full bg-transparent px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Lowercase letters, numbers and hyphens only.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Description *</label>
                <span className="text-[11px] text-muted-foreground">{description.length} chars</span>
              </div>
              <textarea
                required
                rows={5}
                placeholder="Describe fit, feel, fabric details, cut, tailoring and styling tips…"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full rounded-lg border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          {/* Section 2: Variant Matrix & Inventory */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-foreground" />
                <h2 className="text-sm font-bold text-foreground">Variants &amp; Inventory Matrix</h2>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                {totalVariants} Variants ({totalStockUnits} Units)
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Define color groups and select sizes. An individual SKU is automatically generated for every size option.
            </p>

            <div className="space-y-4">
              {groups.map((group, index) => (
                <div
                  key={group.id}
                  className="rounded-xl border border-border bg-muted/20 p-4 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Color Group #{index + 1}
                    </span>
                    {groups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGroup(group.id)}
                        className="rounded p-1 text-muted-foreground hover:text-rose-600 transition"
                        title="Remove color group"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Color Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Olive Green"
                        value={group.color}
                        onChange={(e) => updateGroup(group.id, "color", e.target.value)}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">SKU Prefix (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. LINEN-OLV"
                        value={group.sku}
                        onChange={(e) => updateGroup(group.id, "sku", e.target.value.toUpperCase())}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Stock per Size *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={group.stockQuantity}
                        onChange={(e) => updateGroup(group.id, "stockQuantity", Number(e.target.value) || 0)}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  {/* Size toggles */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <label className="text-xs font-semibold text-foreground">
                      Select Available Sizes *
                    </label>
                    <SizeToggleGroup
                      selected={group.sizes}
                      onChange={(sizes) => updateGroup(group.id, "sizes", sizes)}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addGroup}
                className="w-full text-xs font-semibold h-9 border-dashed"
              >
                <Plus size={14} /> Add Another Color Group
              </Button>
            </div>
          </div>

          {/* Section 3: Attributes & Fabric Care */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Tag size={16} className="text-foreground" />
              <h2 className="text-sm font-bold text-foreground">Garment Specs &amp; Fabric Care</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Material Composition</label>
                <input
                  type="text"
                  placeholder="e.g. 100% French Flax Linen, 180 GSM"
                  value={material}
                  onChange={(e) => {
                    setMaterial(e.target.value);
                    setIsDirty(true);
                  }}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Care Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Machine wash cold, hang dry in shade"
                  value={careInstructions}
                  onChange={(e) => {
                    setCareInstructions(e.target.value);
                    setIsDirty(true);
                  }}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Controls (Pricing, Category, Image, Status) */}
        <div className="space-y-6">
          {/* Section 4: Publishing & Status */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">
              Status &amp; Visibility
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Product Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatus("PUBLISHED");
                    setIsDirty(true);
                  }}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-xs font-bold transition ${
                    status === "PUBLISHED"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-emerald-700">PUBLISHED</span>
                  <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    Live on store
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus("DRAFT");
                    setIsDirty(true);
                  }}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-xs font-bold transition ${
                    status === "DRAFT"
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-amber-700">DRAFT</span>
                  <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    Internal review
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Pricing */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <DollarSign size={16} className="text-foreground" />
              <h2 className="text-sm font-bold text-foreground">Base Price (BDT)</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Base Retail Price (৳) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                  ৳
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  step={1}
                  placeholder="3450"
                  value={basePrice}
                  onChange={(e) => {
                    setBasePrice(e.target.value ? Number(e.target.value) : "");
                    setIsDirty(true);
                  }}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs font-bold text-foreground placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Stored in Poisha:{" "}
                <strong className="text-foreground font-mono">
                  {basePrice ? Math.round(Number(basePrice) * 100) : 0} poisha
                </strong>
              </p>
            </div>
          </div>

          {/* Section 6: Category Hierarchy Selection */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">
              Category Hierarchy
            </h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Top-Level Category *</label>
                <select
                  value={parentCategoryId}
                  onChange={(e) => handleParentCategoryChange(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select a category</option>
                  {topLevelCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {availableSubcategories.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Subcategory (Optional)</label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => {
                      setSubcategoryId(e.target.value);
                      setIsDirty(true);
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="">None (Use Top-Level &quot;{selectedParentCategory?.name}&quot;)</option>
                    {availableSubcategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hierarchy path visual indicator */}
              <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <span>Catalog:</span>
                <span className="font-bold text-foreground">
                  {selectedParentCategory?.name || "Unselected"}
                </span>
                {subcategoryId && (
                  <>
                    <span>&rarr;</span>
                    <span className="font-bold text-foreground">
                      {availableSubcategories.find((c) => c.id === subcategoryId)?.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 7: Cloudinary Image Upload */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ImageIcon size={16} className="text-foreground" />
              <h2 className="text-sm font-bold text-foreground">Product Image</h2>
            </div>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={imagePreview}
                    alt={name || "Product preview"}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  {imageUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-bold gap-2">
                      <Spinner size="sm" />
                      <span>Uploading to Cloudinary…</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 text-xs"
                  >
                    Replace Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center cursor-pointer hover:bg-muted/40 transition"
              >
                <UploadCloud size={28} className="text-muted-foreground mb-2" />
                <p className="text-xs font-bold text-foreground">Upload Image</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Drag &amp; drop or click to browse (JPEG, PNG, WebP up to 10MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Form Submit & Cancel Controls */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3">
            <Button
              type="submit"
              disabled={loading || imageUploading}
              className="w-full text-xs font-bold h-10 shadow-sm"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>{isEdit ? "Saving Changes…" : "Creating Product…"}</span>
                </>
              ) : (
                <span>{isEdit ? "Save Product Changes" : "Publish New Product"}</span>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full text-xs h-9"
            >
              <Link href="/admin/products">
                <ArrowLeft size={13} /> Return to Catalog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
