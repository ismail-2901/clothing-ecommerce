"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-danger/30 bg-danger/10 px-2 py-1">
        <span className="text-xs text-danger font-medium whitespace-nowrap">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-danger px-2 py-0.5 text-xs font-semibold text-white hover:bg-danger/80 disabled:opacity-60"
        >
          {loading ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Delete ${productName}`}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-danger/40 hover:text-danger"
    >
      <Trash2 size={14} />
    </button>
  );
}
