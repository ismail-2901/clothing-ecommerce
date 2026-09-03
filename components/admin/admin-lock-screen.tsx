"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { storeConfig } from "@/config/store";

export function AdminLockScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password. Access denied.");
        return;
      }

      router.refresh();
    } catch {
      setLoading(false);
      setError("An unexpected network error occurred.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
            <Lock className="h-5 w-5 text-foreground" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {storeConfig.name} Security
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin Authorization</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted. Enter your master administrator password to unlock the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Input
            id="admin-password"
            type="password"
            label="Master Admin Password"
            placeholder="••••••••••••"
            required
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Verifying...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Unlock Dashboard</span>
              </span>
            )}
          </Button>

          <div className="mt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft size={13} />
              <span>Return to storefront</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
