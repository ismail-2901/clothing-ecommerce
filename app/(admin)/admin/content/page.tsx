"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Layers,
  Calendar,
  BookOpen,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ContentItem = {
  id: string;
  title: string;
  slug: string;
  type: "BLOG" | "LOOKBOOK" | "PAGE" | "CAMPAIGN";
  status: "PUBLISHED" | "DRAFT";
  views: number;
  publishedDate: string;
  image: string;
  excerpt: string;
};

const initialContent: ContentItem[] = [
  {
    id: "c1",
    title: "Autumn / Winter 2026 Minimalist Lookbook",
    slug: "aw26-minimalist-lookbook",
    type: "LOOKBOOK",
    status: "PUBLISHED",
    views: 12450,
    publishedDate: "Oct 12, 2026",
    image: "/elaris-women.jpg",
    excerpt: "Exploring architectural silhouettes, raw linen textures, and monochrome essentials tailored for Dhaka's winter."
  },
  {
    id: "c2",
    title: "The Art of Mindful Clothing & Bangladeshi Craftsmanship",
    slug: "art-of-mindful-clothing",
    type: "BLOG",
    status: "PUBLISHED",
    views: 8210,
    publishedDate: "Sep 28, 2026",
    image: "/elaris-men.jpg",
    excerpt: "Behind the seams with local artisans crafting heavyweight organic cotton and structured linen."
  },
  {
    id: "c3",
    title: "Shipping, Delivery & 7-Day Exchange Policy",
    slug: "shipping-and-returns",
    type: "PAGE",
    status: "PUBLISHED",
    views: 14800,
    publishedDate: "Aug 15, 2026",
    image: "/elaris-accessories.jpg",
    excerpt: "Detailed breakdown of our nationwide 48-hour delivery network across all 64 districts in Bangladesh."
  },
  {
    id: "c4",
    title: "Capsule Wardrobe Guide: 7 Pieces for 30 Outfits",
    slug: "capsule-wardrobe-guide",
    type: "BLOG",
    status: "DRAFT",
    views: 0,
    publishedDate: "Draft (Unpublished)",
    image: "/elaris-hero.jpg",
    excerpt: "How to simplify your daily aesthetic without sacrificing comfort or editorial elegance."
  }
];

export default function AdminContentPage() {
  const [contentList, setContentList] = useState<ContentItem[]>(initialContent);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const totalViews = contentList.reduce((sum, c) => sum + c.views, 0);
  const publishedCount = contentList.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = contentList.filter((c) => c.status === "DRAFT").length;

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete content article "${title}"?`)) {
      setContentList((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filtered = contentList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Content Hub &amp; Editorial
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {contentList.length} Items
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage lookbook campaigns, brand stories, customer policies, and visual marketing pages
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild className="text-xs h-8">
            <Link href="/admin/content/create">
              <Plus size={14} /> Create Content
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Articles &amp; Pages</p>
          <p className="mt-2 text-2xl font-black text-foreground">{contentList.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Active CMS entries</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Published</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{publishedCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Accessible by readers</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Drafts &amp; Staging</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{draftCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">In editorial preparation</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Content Views</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalViews.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Organic brand discovery</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search article headline, slug, topic…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Content", value: "ALL" },
            { label: "Lookbooks", value: "LOOKBOOK" },
            { label: "Blog & Stories", value: "BLOG" },
            { label: "Store Pages", value: "PAGE" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setTypeFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === tab.value
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content List / Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl border border-border bg-background p-5 shadow-sm hover:border-foreground/30 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted border border-border/60">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                  {item.type}
                </span>
                <span
                  className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    item.status === "PUBLISHED"
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:underline">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.excerpt}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                <span>{item.publishedDate}</span>
                {item.views > 0 && <span>• {item.views.toLocaleString()} views</span>}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/content/pages/${item.id}`}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition"
                >
                  Page Builder
                </Link>
                <Link
                  href={`/admin/content/create?id=${item.id}`}
                  className="rounded-md bg-foreground px-2.5 py-1 text-xs font-bold text-background hover:bg-foreground/90 transition"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="rounded-md border border-border p-1 text-muted-foreground hover:text-rose-600 transition"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
