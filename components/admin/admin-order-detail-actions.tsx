"use client";

import { useState } from "react";
import { Printer, FileText, Truck, Copy, Check } from "lucide-react";
import { AdminOrderDocuments, type PrintableOrder } from "@/components/admin/admin-order-documents";

export function AdminOrderDetailActions({ order }: { order: PrintableOrder }) {
  const [activeModal, setActiveModal] = useState<"invoice" | "pathao" | "steadfast" | "redx" | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyOrderId}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition shadow-xs"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy ID"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("invoice")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition shadow-xs"
        >
          <FileText size={13} />
          <span>Print Invoice</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("pathao")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-bold text-background hover:bg-foreground/90 transition shadow-xs"
        >
          <Truck size={13} />
          <span>Courier Consignment</span>
        </button>
      </div>

      {activeModal && (
        <AdminOrderDocuments
          order={order}
          defaultTemplate={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}

