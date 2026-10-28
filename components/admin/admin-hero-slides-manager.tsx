"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlay, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Save, Eye, EyeOff, RotateCcw } from "lucide-react";
import type { HeroSlideData } from "@/lib/cache/db-cache";
import { Button } from "@/components/ui/button";

type Slide = HeroSlideData;

const EMPTY_SLIDE = (): Slide => ({
  id: `slide-${Date.now()}`,
  num: "01",
  kicker: "",
  headline: ["", ""],
  subline: "",
  ctaText: "Shop Now",
  ctaHref: "/shop",
  image: "",
  alt: "",
  badgeDiscount: "",
  badgeNote: "",
  isActive: true,
});

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "slide-1", num: "01", kicker: "New Season '25",
    headline: ["Wear Your", "Story"],
    subline: "Minimal. Modern. Made for you.",
    ctaText: "Shop New In", ctaHref: "/shop",
    image: "/elaris-hero.jpg", alt: "Man in Elaris black sweatshirt and cap",
    badgeDiscount: "30%", badgeNote: "ON SELECTED ITEMS", isActive: true
  },
  {
    id: "slide-2", num: "02", kicker: "Spring Essentials",
    headline: ["Form &", "Function"],
    subline: "Clean lines engineered for effortless movement.",
    ctaText: "Shop Collection", ctaHref: "/shop?category=women",
    image: "/elaris-women.jpg", alt: "Woman in Elaris modern knitwear",
    badgeDiscount: "25%", badgeNote: "SPRING DROP", isActive: true
  },
  {
    id: "slide-3", num: "03", kicker: "Urban Signature",
    headline: ["Timeless", "Comfort"],
    subline: "Understated essentials designed to outlast the season.",
    ctaText: "Explore Men", ctaHref: "/shop?category=men",
    image: "/elaris-men.jpg", alt: "Man in Elaris urban streetwear",
    badgeDiscount: "20%", badgeNote: "LIMITED DROP", isActive: true
  }
];

export function AdminHeroSlidesManager({ initialSlides }: { initialSlides: Slide[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides.length > 0 ? initialSlides : DEFAULT_SLIDES
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingSlide = slides.find((s) => s.id === editingId) ?? null;

  function updateSlide(id: string, patch: Partial<Slide>) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSlide() {
    const s = EMPTY_SLIDE();
    s.num = String(slides.length + 1).padStart(2, "0");
    setSlides((prev) => [...prev, s]);
    setEditingId(s.id);
  }

  function removeSlide(id: string) {
    if (!confirm("Delete this slide?")) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function moveSlide(id: string, dir: "up" | "down") {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Failed to save");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!confirm("Reset to default slides? Unsaved changes will be lost.")) return;
    setSlides(DEFAULT_SLIDES);
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ImagePlay className="h-6 w-6 text-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Hero Slides</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Edit homepage banner slides — text, images, CTA, badges</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={addSlide}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/60 transition-colors"
          >
            <Plus size={13} /> Add Slide
          </button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save size={13} />
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Slide List */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Slides ({slides.length})</p>
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`group flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
                editingId === slide.id
                  ? "border-foreground bg-foreground/5"
                  : "border-border bg-background hover:border-foreground/40"
              }`}
              onClick={() => setEditingId(slide.id)}
            >
              <GripVertical size={14} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground">{slide.num}</span>
                  <span className="text-sm font-semibold text-foreground truncate">{slide.kicker || "Untitled"}</span>
                  {!slide.isActive && <EyeOff size={11} className="text-muted-foreground shrink-0" />}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{slide.headline.join(" ")}</p>
              </div>
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "up"); }} disabled={idx === 0}
                  className="rounded p-0.5 hover:bg-muted disabled:opacity-30">
                  <ChevronUp size={12} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "down"); }} disabled={idx === slides.length - 1}
                  className="rounded p-0.5 hover:bg-muted disabled:opacity-30">
                  <ChevronDown size={12} />
                </button>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
                className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-red-50 hover:text-red-600 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {slides.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No slides. Click &ldquo;Add Slide&rdquo; to create one.
            </div>
          )}
        </div>

        {/* Slide Editor */}
        {editingSlide ? (
          <div className="rounded-xl border border-border bg-background p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Editing: {editingSlide.kicker || "Slide"}</h2>
              <button
                type="button"
                onClick={() => updateSlide(editingSlide.id, { isActive: !editingSlide.isActive })}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-colors ${
                  editingSlide.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-zinc-100 text-zinc-500 border-zinc-200"
                }`}
              >
                {editingSlide.isActive ? <><Eye size={11} /> Active</> : <><EyeOff size={11} /> Hidden</>}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Slide Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Slide Number</label>
                <input
                  value={editingSlide.num}
                  onChange={(e) => updateSlide(editingSlide.id, { num: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="01"
                  maxLength={4}
                />
              </div>

              {/* Kicker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Kicker (top label)</label>
                <input
                  value={editingSlide.kicker}
                  onChange={(e) => updateSlide(editingSlide.id, { kicker: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="Spring Essentials"
                  maxLength={80}
                />
              </div>

              {/* Headline Line 1 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Headline — Line 1</label>
                <input
                  value={editingSlide.headline[0]}
                  onChange={(e) => updateSlide(editingSlide.id, { headline: [e.target.value, editingSlide.headline[1]] })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="Form &"
                  maxLength={60}
                />
              </div>

              {/* Headline Line 2 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Headline — Line 2</label>
                <input
                  value={editingSlide.headline[1]}
                  onChange={(e) => updateSlide(editingSlide.id, { headline: [editingSlide.headline[0], e.target.value] })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="Function"
                  maxLength={60}
                />
              </div>

              {/* Subline */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-foreground">Subline / Description</label>
                <textarea
                  value={editingSlide.subline}
                  onChange={(e) => updateSlide(editingSlide.id, { subline: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  placeholder="Clean lines engineered for effortless movement."
                  maxLength={160}
                />
              </div>

              {/* CTA Text */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Button Text</label>
                <input
                  value={editingSlide.ctaText}
                  onChange={(e) => updateSlide(editingSlide.id, { ctaText: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="Shop Collection"
                  maxLength={40}
                />
              </div>

              {/* CTA Href */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Button Link (URL)</label>
                <input
                  value={editingSlide.ctaHref}
                  onChange={(e) => updateSlide(editingSlide.id, { ctaHref: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="/shop?category=women"
                  maxLength={200}
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-foreground">Image URL or Path</label>
                <input
                  value={editingSlide.image}
                  onChange={(e) => updateSlide(editingSlide.id, { image: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="/elaris-women.jpg or https://..."
                  maxLength={500}
                />
                {editingSlide.image && (
                  <div className="mt-2 h-28 w-full overflow-hidden rounded-lg border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editingSlide.image} alt="preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-foreground">Image Alt Text</label>
                <input
                  value={editingSlide.alt}
                  onChange={(e) => updateSlide(editingSlide.id, { alt: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="Woman in Elaris modern knitwear"
                  maxLength={200}
                />
              </div>

              {/* Badge Discount */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Badge Discount</label>
                <input
                  value={editingSlide.badgeDiscount}
                  onChange={(e) => updateSlide(editingSlide.id, { badgeDiscount: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="25%"
                  maxLength={10}
                />
              </div>

              {/* Badge Note */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Badge Note</label>
                <input
                  value={editingSlide.badgeNote}
                  onChange={(e) => updateSlide(editingSlide.id, { badgeNote: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="SPRING DROP"
                  maxLength={40}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
            <div>
              <ImagePlay className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Select a slide from the list to edit it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
