"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Link2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminContentCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("LOOKBOOK");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [saved, setSaved] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    setMetaTitle(`${val} | ELARIS`);
  };

  const handleSave = (status: "PUBLISHED" | "DRAFT") => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/admin/content");
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="rounded-full border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {title.trim() ? title : "Untitled Article / Campaign"}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              /content/{slug || "slug-placeholder"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <CheckCircle2 size={14} /> Saved!
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Save Draft
          </button>
          <Button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            className="text-xs font-bold h-8"
          >
            Publish Live
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
        {/* Main Editor Surface */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Headline Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autumn / Winter 2026 Editorial Campaign"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3.5 text-base font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Summary / Excerpt
            </label>
            <textarea
              rows={2}
              placeholder="Brief introductory overview displayed on article cards and search results…"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                setMetaDesc(e.target.value);
              }}
              className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Editorial Body Content
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 text-muted-foreground">
                <button type="button" className="p-1 hover:text-foreground rounded"><Bold size={13} /></button>
                <button type="button" className="p-1 hover:text-foreground rounded"><Italic size={13} /></button>
                <button type="button" className="p-1 hover:text-foreground rounded"><Heading size={13} /></button>
                <button type="button" className="p-1 hover:text-foreground rounded"><List size={13} /></button>
                <button type="button" className="p-1 hover:text-foreground rounded"><Quote size={13} /></button>
                <button type="button" className="p-1 hover:text-foreground rounded"><Link2 size={13} /></button>
              </div>
            </div>

            <textarea
              rows={12}
              placeholder="Write your editorial story, styling notes, fabric descriptions, or policy guidelines here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-4 text-xs font-serif leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          {/* SEO Metadata Card */}
          <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Search Engine Optimization (SEO)
            </h3>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Meta Description</label>
              <input
                type="text"
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Configuration */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Publishing Settings
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Content Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="LOOKBOOK">Lookbook / Campaign</option>
                <option value="BLOG">Journal &amp; Stories</option>
                <option value="PAGE">Store Information &amp; Policy</option>
                <option value="CAMPAIGN">Promotional Landing Page</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Featured Cover Image</label>
              <input
                type="text"
                placeholder="https://... or /elaris-women.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs space-y-2">
            <span className="font-bold text-foreground">Editorial Guidelines:</span>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Keep high-resolution imagery aspect ratio at 16:9 or 3:4. Use minimalist typography consistent with ELARIS brand standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
