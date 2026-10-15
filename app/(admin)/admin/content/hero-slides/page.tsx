"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, GripVertical, Save, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroSlideData } from "@/lib/cache/db-cache";

type Slide = HeroSlideData;

const EMPTY_SLIDE = (): Slide => ({
  id: `slide-${Date.now()}`,
  num: "01",
  kicker: "",
  headline: ["", ""],
  subline: "",
  ctaText: "Shop Now",
  ctaHref: "/shop",
  image: "/elaris-hero.jpg",
  alt: "",
  badgeDiscount: "",
  badgeNote: "",
  isActive: true
});

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Fetch current slides on mount
  useEffect(() => {
    fetch("/api/admin/hero-slides")
      .then((r) => r.json())
      .then((data: { slides: Slide[] }) => {
        setSlides(data.slides?.length ? data.slides : []);
      })
      .catch(() => setStatus({ type: "error", msg: "Failed to load slides" }))
      .finally(() => setLoading(false));
  }, []);

  const updateSlide = useCallback((index: number, patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }, []);

  const updateHeadline = useCallback((index: number, part: 0 | 1, value: string) => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const h: [string, string] = [...s.headline] as [string, string];
        h[part] = value;
        return { ...s, headline: h };
      })
    );
  }, []);

  const addSlide = () => {
    const newSlide = EMPTY_SLIDE();
    newSlide.num = String(slides.length + 1).padStart(2, "0");
    setSlides((prev) => [...prev, newSlide]);
  };

  const removeSlide = (index: number) => {
    setSlides((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Re-number
      return next.map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0") }));
    });
  };

  const toggleActive = (index: number) => {
    updateSlide(index, { isActive: !slides[index].isActive });
  };

  // Drag-and-drop reorder
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) return;
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0") }));
    });
    setDragIndex(targetIndex);
  };
  const handleDragEnd = () => setDragIndex(null);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides })
      });
      if (res.ok) {
        setStatus({ type: "success", msg: "Hero slides saved and storefront updated." });
      } else {
        const err = await res.json() as { error?: string };
        setStatus({ type: "error", msg: err.error ?? "Save failed" });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error — try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Hero Slides</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag to reorder · toggle eye to show/hide · changes go live in ≤60 s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSlide}
            disabled={slides.length >= 8}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} /> Add Slide
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving || slides.length === 0}
            className="flex items-center gap-1.5 text-xs"
          >
            {saving ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving…" : "Save & Publish"}
          </Button>
        </div>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          {status.msg}
        </div>
      )}

      {/* Empty state */}
      {slides.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">No slides yet.</p>
          <Button type="button" size="sm" onClick={addSlide} className="text-xs">
            <Plus size={13} className="mr-1" /> Add First Slide
          </Button>
        </div>
      )}

      {/* Slide cards */}
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`rounded-xl border bg-card p-5 space-y-4 transition-all ${
              dragIndex === index ? "opacity-50 ring-2 ring-foreground/20" : ""
            } ${!slide.isActive ? "opacity-60" : ""}`}
          >
            {/* Card header */}
            <div className="flex items-center gap-3">
              <GripVertical
                size={16}
                className="cursor-grab text-muted-foreground shrink-0"
              />
              <span className="text-sm font-bold text-muted-foreground w-6">{slide.num}</span>
              <div className="flex-1 font-semibold text-sm truncate">
                {slide.kicker || <span className="text-muted-foreground italic">Untitled slide</span>}
              </div>
              <button
                type="button"
                onClick={() => toggleActive(index)}
                title={slide.isActive ? "Hide slide" : "Show slide"}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {slide.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                type="button"
                onClick={() => removeSlide(index)}
                title="Delete slide"
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Kicker (small text above headline)">
                <input
                  type="text"
                  value={slide.kicker}
                  onChange={(e) => updateSlide(index, { kicker: e.target.value })}
                  maxLength={80}
                  className={inputCls}
                  placeholder="New Season '25"
                />
              </Field>

              <Field label="Headline — Line 1">
                <input
                  type="text"
                  value={slide.headline[0]}
                  onChange={(e) => updateHeadline(index, 0, e.target.value)}
                  maxLength={60}
                  className={inputCls}
                  placeholder="Wear Your"
                />
              </Field>

              <Field label="Headline — Line 2">
                <input
                  type="text"
                  value={slide.headline[1]}
                  onChange={(e) => updateHeadline(index, 1, e.target.value)}
                  maxLength={60}
                  className={inputCls}
                  placeholder="Story"
                />
              </Field>

              <Field label="Sub-line">
                <input
                  type="text"
                  value={slide.subline}
                  onChange={(e) => updateSlide(index, { subline: e.target.value })}
                  maxLength={160}
                  className={inputCls}
                  placeholder="Minimal. Modern. Made for you."
                />
              </Field>

              <Field label="CTA Button Text">
                <input
                  type="text"
                  value={slide.ctaText}
                  onChange={(e) => updateSlide(index, { ctaText: e.target.value })}
                  maxLength={40}
                  className={inputCls}
                  placeholder="Shop New In"
                />
              </Field>

              <Field label="CTA Link (URL)">
                <input
                  type="text"
                  value={slide.ctaHref}
                  onChange={(e) => updateSlide(index, { ctaHref: e.target.value })}
                  maxLength={200}
                  className={inputCls}
                  placeholder="/shop?category=women"
                />
              </Field>

              <Field label="Image path or URL">
                <input
                  type="text"
                  value={slide.image}
                  onChange={(e) => updateSlide(index, { image: e.target.value })}
                  maxLength={500}
                  className={inputCls}
                  placeholder="/elaris-hero.jpg"
                />
              </Field>

              <Field label="Image alt text">
                <input
                  type="text"
                  value={slide.alt}
                  onChange={(e) => updateSlide(index, { alt: e.target.value })}
                  maxLength={200}
                  className={inputCls}
                  placeholder="Model wearing Elaris black sweatshirt"
                />
              </Field>

              <Field label="Badge discount (e.g. 30%)">
                <input
                  type="text"
                  value={slide.badgeDiscount}
                  onChange={(e) => updateSlide(index, { badgeDiscount: e.target.value })}
                  maxLength={10}
                  className={inputCls}
                  placeholder="30%"
                />
              </Field>

              <Field label="Badge note (e.g. ON SELECTED ITEMS)">
                <input
                  type="text"
                  value={slide.badgeNote}
                  onChange={(e) => updateSlide(index, { badgeNote: e.target.value })}
                  maxLength={40}
                  className={inputCls}
                  placeholder="ON SELECTED ITEMS"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom save */}
      {slides.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save & Publish"}
          </Button>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
