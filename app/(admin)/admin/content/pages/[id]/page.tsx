"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  CheckCircle2,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Block = {
  id: string;
  type: "HERO" | "GRID" | "QUOTE" | "NEWSLETTER";
  title: string;
  subtitle?: string;
  ctaText?: string;
};

export default function AdminPageBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [saved, setSaved] = useState(false);

  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "b1",
      type: "HERO",
      title: "Autumn / Winter 2026",
      subtitle: "Architectural silhouettes and raw linen essentials.",
      ctaText: "Explore Collection"
    },
    {
      id: "b2",
      type: "GRID",
      title: "Featured Runway Pieces",
      subtitle: "Handcrafted in limited seasonal batches."
    },
    {
      id: "b3",
      type: "QUOTE",
      title: "Wear Your Story.",
      subtitle: "Fashion created with patience, conscience, and purposeful design."
    },
    {
      id: "b4",
      type: "NEWSLETTER",
      title: "Join Our Community",
      subtitle: "Receive early access to seasonal lookbooks and private drops."
    }
  ]);

  const moveBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setBlocks(next);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: `b_${Date.now()}`,
      type,
      title: type === "HERO" ? "New Hero Headline" : type === "GRID" ? "New Product Showcase" : "Editorial Quote",
      subtitle: "Customize this block subtitle in the editor."
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
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
            <h1 className="text-xl font-bold text-foreground">Visual Page Builder</h1>
            <p className="text-xs text-muted-foreground">Editing page layout: #{resolvedParams.id}</p>
          </div>
        </div>

        {/* Device Switcher + Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`rounded px-2 py-1 font-semibold transition ${
                device === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`rounded px-2 py-1 font-semibold transition ${
                device === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone size={14} />
            </button>
          </div>

          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <CheckCircle2 size={14} /> Published!
            </span>
          )}

          <Button onClick={handleSave} className="text-xs font-bold h-8">
            Publish Page
          </Button>
        </div>
      </div>

      {/* Two-Column Split: Block Sequencer (Left) + Live Canvas Preview (Right) */}
      <div className="grid gap-8 lg:grid-cols-[380px_1fr] items-start">
        {/* Left Column: Blocks Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Page Layout Blocks ({blocks.length})
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => addBlock("GRID")}
                className="rounded border border-border px-2 py-0.5 text-[10px] font-bold hover:bg-muted"
              >
                + Products
              </button>
              <button
                type="button"
                onClick={() => addBlock("QUOTE")}
                className="rounded border border-border px-2 py-0.5 text-[10px] font-bold hover:bg-muted"
              >
                + Quote
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {blocks.map((b, idx) => (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-foreground">
                    {b.type}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveBlock(idx, "up")}
                      className="p-1 hover:text-foreground disabled:opacity-20"
                    >
                      <MoveUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1}
                      onClick={() => moveBlock(idx, "down")}
                      className="p-1 hover:text-foreground disabled:opacity-20"
                    >
                      <MoveDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(b.id)}
                      className="p-1 hover:text-rose-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={b.title}
                  onChange={(e) => {
                    const next = [...blocks];
                    next[idx].title = e.target.value;
                    setBlocks(next);
                  }}
                  className="w-full rounded border border-border/80 bg-muted/20 px-2 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />

                {b.subtitle !== undefined && (
                  <input
                    type="text"
                    value={b.subtitle}
                    onChange={(e) => {
                      const next = [...blocks];
                      next[idx].subtitle = e.target.value;
                      setBlocks(next);
                    }}
                    className="w-full rounded border border-border/80 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Responsive Canvas */}
        <div className="rounded-2xl border border-border bg-zinc-100 dark:bg-zinc-900 p-6 flex justify-center min-h-[600px] overflow-x-auto">
          <div
            className={`transition-all duration-300 rounded-xl border border-border bg-background overflow-hidden shadow-2xl ${
              device === "mobile" ? "w-[360px]" : "w-full max-w-2xl"
            }`}
          >
            {/* Mock Header */}
            <div className="border-b border-border p-3 flex items-center justify-between text-xs">
              <span className="font-black tracking-widest text-[11px]">ELARIS</span>
              <span className="text-[10px] text-muted-foreground">Preview Mode</span>
            </div>

            {/* Block Previews */}
            <div className="divide-y divide-border/60">
              {blocks.map((b) => {
                if (b.type === "HERO") {
                  return (
                    <div
                      key={b.id}
                      className="p-8 text-center bg-zinc-900 text-white space-y-3"
                    >
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">
                        NEW COLLECTION
                      </p>
                      <h2 className="text-2xl font-bold font-serif">{b.title}</h2>
                      <p className="text-xs text-zinc-300 max-w-sm mx-auto">{b.subtitle}</p>
                      <button className="mt-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black">
                        {b.ctaText || "Shop Now"}
                      </button>
                    </div>
                  );
                }

                if (b.type === "GRID") {
                  return (
                    <div key={b.id} className="p-6 space-y-4">
                      <div className="text-center">
                        <h3 className="text-sm font-bold">{b.title}</h3>
                        <p className="text-[11px] text-muted-foreground">{b.subtitle}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="aspect-[3/4] rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                          Product 1
                        </div>
                        <div className="aspect-[3/4] rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                          Product 2
                        </div>
                      </div>
                    </div>
                  );
                }

                if (b.type === "QUOTE") {
                  return (
                    <div key={b.id} className="p-8 text-center bg-muted/20 space-y-2">
                      <h3 className="font-serif italic text-xl font-medium">{b.title}</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">{b.subtitle}</p>
                    </div>
                  );
                }

                return (
                  <div key={b.id} className="p-6 text-center space-y-2">
                    <h4 className="text-xs font-bold">{b.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{b.subtitle}</p>
                    <div className="flex max-w-xs mx-auto gap-2 pt-2">
                      <input
                        type="email"
                        placeholder="Enter email"
                        disabled
                        className="h-8 w-full rounded border border-border px-2 text-xs"
                      />
                      <button className="rounded bg-foreground px-3 text-xs font-bold text-background">
                        Join
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
