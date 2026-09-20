import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/money";
import { ShieldCheck, ArrowRight, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// BUG-20 FIX: This page must NEVER be reachable in production.
// It allows simulating any payment outcome without real credentials.
// ---------------------------------------------------------------------------
const ALLOWED_PROVIDERS = ["COD", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD"] as const;
type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];

const TRAN_ID_RE = /^[A-Za-z0-9_\-]{1,200}$/;

export default async function PaymentSimulatorPage({
  searchParams
}: {
  searchParams: Promise<{ provider?: string; tran_id?: string; amount?: string }>;
}) {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { provider = "CARD", tran_id = "test_tran", amount = "0" } = await searchParams;
  const numAmount = Number(amount) || 0;

  // Whitelist-validate provider
  const normalizedProvider = provider.toUpperCase() as AllowedProvider;
  if (!ALLOWED_PROVIDERS.includes(normalizedProvider)) {
    notFound();
  }

  // Sanitize tran_id — reject anything that looks like a path traversal or injection
  if (!TRAN_ID_RE.test(tran_id)) {
    notFound();
  }

  const providerNames: Record<AllowedProvider, string> = {
    COD: "Cash on Delivery",
    SSLCOMMERZ: "SSLCommerz Sandbox",
    BKASH: "bKash Checkout",
    NAGAD: "Nagad Gateway",
    CARD: "Credit / Debit Card"
  };

  const name = providerNames[normalizedProvider];

  return (
    <div className="container-shell min-h-[75vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ShieldCheck size={26} />
          </div>
          <p className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">
            Payment Sandbox Simulator
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{name}</h1>
          <p className="text-xs text-muted-foreground">
            Transaction Ref: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{tran_id}</code>
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 flex items-center justify-between text-sm font-bold">
          <span className="text-muted-foreground">Amount to Pay:</span>
          <span className="text-xl font-extrabold text-foreground">{formatMoney(numAmount)}</span>
        </div>

        <div className="space-y-3">
          <Link
            href={`/api/payments/verify?provider=${encodeURIComponent(normalizedProvider)}&tran_id=${encodeURIComponent(tran_id)}`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition shadow-md"
          >
            Complete Test Payment <ArrowRight size={15} />
          </Link>

          <Link
            href={`/checkout?error=Payment+cancelled+by+user`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-xs font-semibold text-muted-foreground hover:bg-muted transition"
          >
            <XCircle size={15} /> Cancel Transaction
          </Link>
        </div>

        <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
          🔒 In a production environment with merchant credentials, this automatically redirects to the provider&apos;s live gateway.
        </p>
      </div>
    </div>
  );
}
