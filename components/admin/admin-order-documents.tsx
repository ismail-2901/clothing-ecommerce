"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils/money";
import { Printer, X, ExternalLink, Check, Copy, Truck, FileText, Package } from "lucide-react";
import { storeConfig } from "@/config/store";

export type PrintableOrder = {
  id: string;
  orderNumber: string;
  createdAt: Date | string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  customerSnapshot?: Record<string, any> | null;
  deliveryAddress?: {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    area?: string;
    postalCode?: string;
    notes?: string;
  } | null;
  items: Array<{
    id: string;
    name: string;
    color?: string | null;
    size?: string | null;
    sku?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    productSnapshot?: Record<string, any> | null;
  }>;
  payments?: Array<{
    provider?: string | null;
    status?: string | null;
    providerPaymentId?: string | null;
  }>;
};

type DocumentTemplate = "invoice" | "pathao" | "steadfast" | "redx";

export function AdminOrderDocuments({
  order,
  onClose,
  defaultTemplate = "invoice",
  isModal = true
}: {
  order: PrintableOrder;
  onClose?: () => void;
  defaultTemplate?: DocumentTemplate;
  isModal?: boolean;
}) {
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate>(defaultTemplate);
  const [copied, setCopied] = useState(false);

  const customerName =
    order.user?.name ||
    order.customerSnapshot?.name ||
    order.deliveryAddress?.name ||
    "Valued Customer";

  const customerEmail =
    order.user?.email ||
    order.customerSnapshot?.email ||
    "support@elarisstore.com";

  const customerPhone =
    order.deliveryAddress?.phone ||
    order.user?.phone ||
    order.customerSnapshot?.phone ||
    "Not provided";

  const address = order.deliveryAddress;
  const addressLine = [
    address?.line1,
    address?.line2,
    address?.area,
    address?.city,
    address?.postalCode
  ]
    .filter(Boolean)
    .join(", ") || "Address details on file";

  const destinationCity = (address?.city || "Dhaka").trim();
  const isInsideDhaka = destinationCity.toLowerCase().includes("dhaka");
  const paymentProvider = order.payments?.[0]?.provider || "COD";
  const isCOD = paymentProvider.toUpperCase() === "COD";
  const isPaid = order.paymentStatus.toUpperCase() === "PAID";

  const codPayableAmount = isPaid ? 0 : order.grandTotal;

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const totalItemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

  const handlePrint = () => {
    window.print();
  };

  const copyOrderRef = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
          : "w-full"
      }
    >
      <div
        className={
          isModal
            ? "relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]"
            : "w-full bg-white"
        }
      >
        {/* Top Header Controls (Hidden during print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Printable Generator
            </span>
            <span className="text-sm font-black font-mono text-zinc-900">
              #{order.orderNumber}
            </span>
            <button
              onClick={copyOrderRef}
              title="Copy Order #"
              className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 transition"
            >
              {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Template Switcher Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1">
            {[
              { id: "invoice", label: "Invoice", icon: FileText },
              { id: "pathao", label: "Pathao", icon: Truck },
              { id: "steadfast", label: "Steadfast", icon: Package },
              { id: "redx", label: "RedX", icon: Truck }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTemplate === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTemplate(tab.id as DocumentTemplate)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition shadow-sm"
            >
              <Printer size={13} />
              <span>Print Document</span>
            </button>

            {isModal && (
              <a
                href={`/admin/orders/${order.id}/print?template=${activeTemplate}`}
                target="_blank"
                rel="noreferrer"
                title="Open clean print view in new tab"
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-100 transition"
              >
                <ExternalLink size={14} />
              </a>
            )}

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Preview Area & Printable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100/60 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-document"
            className="mx-auto max-w-2xl bg-white p-6 sm:p-10 shadow-sm border border-zinc-200 print:border-none print:shadow-none print:p-0 print:max-w-none text-zinc-900 text-xs font-sans leading-relaxed"
          >
            {/* 1. CUSTOMER INVOICE TEMPLATE */}
            {activeTemplate === "invoice" && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-5">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-[0.16em] text-zinc-950">
                      {storeConfig.name}
                    </h1>
                    <p className="mt-1 text-[11px] text-zinc-600">
                      Premium Contemporary Apparel &amp; Lifestyle
                    </p>
                    <p className="text-[11px] text-zinc-500">{storeConfig.contact.address}</p>
                    <p className="text-[11px] text-zinc-500">
                      Hotline: {storeConfig.contact.phone} &bull; {storeConfig.contact.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded bg-zinc-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Tax Invoice
                    </span>
                    <p className="mt-2 text-xs font-mono font-bold text-zinc-900">
                      INV-{order.orderNumber}
                    </p>
                    <p className="text-[11px] text-zinc-500">Date: {orderDate}</p>
                    <p className="text-[11px] text-zinc-500">
                      Status:{" "}
                      <span className="font-bold text-zinc-800 uppercase">{order.status}</span>
                    </p>
                  </div>
                </div>

                {/* Customer & Shipping Summary */}
                <div className="grid grid-cols-2 gap-6 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Billed / Sold To:
                    </p>
                    <p className="mt-1 font-bold text-sm text-zinc-900">{customerName}</p>
                    <p className="text-xs text-zinc-600">{customerEmail}</p>
                    <p className="text-xs text-zinc-600 font-mono">{customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Fulfillment &amp; Delivery:
                    </p>
                    <p className="mt-1 font-medium text-xs text-zinc-800 leading-snug">
                      {addressLine}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-zinc-700">
                        {paymentProvider.toUpperCase()}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isPaid ? "PAID ONLINE" : "COLLECT ON DELIVERY"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Itemized Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-zinc-300 bg-zinc-100 font-bold text-zinc-700">
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-3 text-center">SKU / Variant</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-center w-12">Qty</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {order.items.map((it, idx) => {
                      const snapshot = it.productSnapshot as Record<string, any> | null;
                      const title = snapshot?.name || it.name;
                      const color = snapshot?.color || it.color;
                      const size = snapshot?.size || it.size;
                      const sku = snapshot?.sku || it.sku || "—";

                      return (
                        <tr key={it.id || idx}>
                          <td className="py-2.5 px-3 text-zinc-500 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-zinc-900">{title}</p>
                          </td>
                          <td className="py-2.5 px-3 text-center text-zinc-600 font-mono text-[11px]">
                            {color && size ? `${color} / ${size}` : sku}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-zinc-800">
                            {formatMoney(it.unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-zinc-900 font-mono">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-zinc-950 font-mono">
                            {formatMoney(it.lineTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Price Breakdown Calculation */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 text-zinc-600">
                      <span>Items Subtotal:</span>
                      <span className="font-mono">{formatMoney(order.subtotal)}</span>
                    </div>
                    {order.discountTotal > 0 && (
                      <div className="flex justify-between py-1 text-rose-600">
                        <span>Discount Applied:</span>
                        <span className="font-mono">−{formatMoney(order.discountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 text-zinc-600">
                      <span>Delivery / Shipping:</span>
                      <span className="font-mono">
                        {order.shippingTotal === 0 ? "FREE" : formatMoney(order.shippingTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t-2 border-zinc-900 pt-2 text-sm font-bold text-zinc-950">
                      <span>Net Total:</span>
                      <span className="font-mono text-base">{formatMoney(order.grandTotal)}</span>
                    </div>
                    <div className="mt-2 rounded bg-zinc-100 p-2 text-center text-[11px] font-bold text-zinc-900">
                      {isPaid ? (
                        <span className="text-emerald-700">PAID &bull; NO CASH COLLECTION</span>
                      ) : (
                        <span>CASH ON DELIVERY DUE: {formatMoney(order.grandTotal)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Footer Notices */}
                <div className="border-t border-zinc-200 pt-5 text-[11px] text-zinc-500 space-y-1">
                  <p className="font-semibold text-zinc-700">Returns &amp; Exchange Policy:</p>
                  <p>
                    Items can be exchanged or returned within 14 days of delivery provided they are
                    unworn, unaltered, and with original price tags attached. For support, reach out
                    via email at {storeConfig.contact.email} or call {storeConfig.contact.phone}.
                  </p>
                  <div className="mt-6 flex justify-between pt-6 border-t border-zinc-200/80">
                    <div>
                      <p className="border-t border-zinc-400 w-44 pt-1 text-center text-[10px] text-zinc-600">
                        Customer Signature
                      </p>
                    </div>
                    <div>
                      <p className="border-t border-zinc-400 w-44 pt-1 text-center text-[10px] text-zinc-600">
                        Authorized Elaris Representative
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PATHAO COURIER CONSIGNMENT SLIP */}
            {activeTemplate === "pathao" && (
              <div className="space-y-5 border-2 border-dashed border-zinc-400 p-5 rounded-lg">
                {/* Header with Pathao Branding simulation */}
                <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-rose-600 px-2 py-1 text-xs font-black uppercase text-white tracking-wider">
                      PATHAO
                    </div>
                    <span className="text-xs font-bold text-zinc-700">Courier Consignment</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Delivery Zone
                    </span>
                    <p className="font-black text-sm text-zinc-900">
                      {isInsideDhaka ? "INSIDE DHAKA (Standard)" : "OUTSIDE DHAKA (Inter-City)"}
                    </p>
                  </div>
                </div>

                {/* Barcode & Reference Block */}
                <div className="flex items-center justify-between bg-zinc-50 p-3 rounded border border-zinc-200">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Merchant Order Ref
                    </p>
                    <p className="text-lg font-black font-mono tracking-tight text-zinc-950">
                      #{order.orderNumber}
                    </p>
                    <p className="text-[10px] text-zinc-500">Created: {orderDate}</p>
                  </div>
                  {/* SVG Code 128 Simulated Barcode */}
                  <div className="text-right">
                    <div className="inline-block bg-white p-1.5 border border-zinc-300 rounded">
                      <div className="flex items-center gap-[2px] h-9">
                        {[4, 2, 6, 2, 4, 3, 5, 2, 6, 3, 2, 4, 5, 2, 3, 6, 2, 4, 5, 3, 2].map(
                          (w, i) => (
                            <div
                              key={i}
                              className="bg-black h-full"
                              style={{ width: `${w}px` }}
                            />
                          )
                        )}
                      </div>
                      <p className="text-[9px] font-mono font-bold tracking-widest text-center mt-0.5">
                        {order.orderNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recipient & Merchant 2-Column Details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Merchant Details */}
                  <div className="rounded border border-zinc-200 p-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Merchant (Sender):
                    </p>
                    <p className="font-bold text-xs text-zinc-900">{storeConfig.name} Lifestyle</p>
                    <p className="text-[11px] text-zinc-600">Merchant ID: ELR-9842</p>
                    <p className="text-[11px] text-zinc-600">{storeConfig.contact.address}</p>
                    <p className="text-[11px] text-zinc-600 font-mono">
                      Contact: {storeConfig.contact.phone}
                    </p>
                  </div>

                  {/* Consignee Details */}
                  <div className="rounded border-2 border-zinc-900 p-3 space-y-1 bg-zinc-50/70">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-900">
                      Recipient (Consignee):
                    </p>
                    <p className="font-black text-sm text-zinc-950">{customerName}</p>
                    <p className="font-mono font-bold text-xs text-zinc-900">{customerPhone}</p>
                    <p className="text-[11px] text-zinc-800 leading-snug">{addressLine}</p>
                  </div>
                </div>

                {/* COD Amount Box & Special Instructions */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded border border-zinc-300 p-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      Package Specification &amp; Instructions:
                    </p>
                    <p className="text-xs font-medium text-zinc-800">
                      Item: Apparel Merchandise &bull; Total Units: {totalItemCount} pcs
                    </p>
                    <p className="text-[11px] text-zinc-600 font-medium">
                      Special Note: Do not open package before payment. Call recipient if
                      unreachable.
                    </p>
                  </div>

                  <div className="rounded-lg border-2 border-zinc-950 bg-zinc-950 text-white p-3 flex flex-col justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      COD Collection
                    </span>
                    <span className="text-xl font-black font-mono tracking-tight text-white mt-1">
                      {isPaid ? "৳ 0" : formatMoney(codPayableAmount)}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-300 mt-0.5">
                      {isPaid ? "PREPAID — DO NOT COLLECT" : "COLLECT IN CASH"}
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between pt-4 border-t border-zinc-200 text-[10px] text-zinc-500">
                  <span>Merchant Handover Sign: _____________________</span>
                  <span>Rider / Courier Sign: _____________________</span>
                </div>
              </div>
            )}

            {/* 3. STEADFAST COURIER CONSIGNMENT SLIP */}
            {activeTemplate === "steadfast" && (
              <div className="space-y-5 border-2 border-zinc-900 p-5 rounded-lg">
                {/* Steadfast Header */}
                <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-sky-700 px-2 py-1 text-xs font-black uppercase text-white tracking-wider">
                      STEADFAST
                    </div>
                    <span className="text-xs font-bold text-zinc-800">Courier Delivery Tag</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Routing Hub
                    </span>
                    <p className="font-black text-sm text-zinc-900 font-mono">
                      HUB-{destinationCity.slice(0, 3).toUpperCase()}-01
                    </p>
                  </div>
                </div>

                {/* Tracking Code and Date */}
                <div className="flex justify-between items-center bg-zinc-100 p-3 rounded">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      Invoice / Tracking ID
                    </span>
                    <p className="text-base font-black font-mono text-zinc-900">
                      SFC-{order.orderNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      Destination City
                    </span>
                    <p className="text-sm font-black text-zinc-900">{destinationCity}</p>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="rounded border border-zinc-300 p-4 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Receiver:
                      </p>
                      <p className="text-base font-bold text-zinc-950">{customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Phone:
                      </p>
                      <p className="text-sm font-black font-mono text-zinc-950">{customerPhone}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 pt-1 leading-snug">{addressLine}</p>
                </div>

                {/* Prominent COD Amount Box */}
                <div className="rounded-xl border-2 border-zinc-900 p-4 bg-zinc-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-zinc-600">
                      Cash to Collect from Customer
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Method: {paymentProvider} &bull; Parcel: Apparel ({totalItemCount} items)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-mono text-zinc-950">
                      {isPaid ? "PAID" : formatMoney(codPayableAmount)}
                    </p>
                  </div>
                </div>

                {/* Steadfast Footnote */}
                <div className="flex justify-between pt-2 text-[10px] text-zinc-500">
                  <span>Merchant: {storeConfig.name}</span>
                  <span>Delivery Agent Code: ____________</span>
                  <span>Received Date: ____________</span>
                </div>
              </div>
            )}

            {/* 4. REDX DELIVERY CONSIGNMENT SLIP */}
            {activeTemplate === "redx" && (
              <div className="space-y-5 border-2 border-red-600 p-5 rounded-lg">
                {/* RedX Header */}
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-red-600 px-2.5 py-1 text-xs font-black uppercase text-white tracking-wider">
                      REDX
                    </div>
                    <span className="text-xs font-bold text-zinc-800">
                      Logistics Delivery Partner
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-red-700">
                      REDX-{order.orderNumber}
                    </p>
                  </div>
                </div>

                {/* Recipient & Address */}
                <div className="rounded border border-zinc-300 p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-600">Deliver To</span>
                  <p className="text-sm font-black text-zinc-950">{customerName}</p>
                  <p className="text-xs font-mono font-bold text-zinc-900">{customerPhone}</p>
                  <p className="text-xs text-zinc-700 leading-snug">{addressLine}</p>
                </div>

                {/* COD & Shipping details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded border border-zinc-200 p-3">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      Package Type
                    </span>
                    <p className="text-xs font-bold text-zinc-800 mt-1">Apparel / Garments</p>
                    <p className="text-[11px] text-zinc-500">Qty: {totalItemCount} items</p>
                  </div>
                  <div className="rounded border-2 border-red-600 bg-red-50/50 p-3 text-right">
                    <span className="text-[10px] font-bold uppercase text-red-700">
                      Collection Amount
                    </span>
                    <p className="text-xl font-black font-mono text-red-700 mt-0.5">
                      {isPaid ? "BDT 0" : formatMoney(codPayableAmount)}
                    </p>
                  </div>
                </div>

                {/* Sender info */}
                <div className="border-t border-zinc-200 pt-3 text-[11px] text-zinc-500 flex justify-between">
                  <span>
                    Sender: {storeConfig.name} ({storeConfig.contact.phone})
                  </span>
                  <span>Return Hub: Gulshan-2, Dhaka</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Print Styles Injection */}
        <style jsx global>{`
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .no-print,
            header,
            aside,
            nav,
            button {
              display: none !important;
            }
            #printable-document {
              display: block !important;
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

