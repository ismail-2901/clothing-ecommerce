"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { storeConfig } from "@/config/store";
import { signIn, signOut, useSession } from "@/lib/auth/client";

export function AdminLockScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalisedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      // 1. Primary: Verify via master admin endpoint (sets secure session cookie)
      const adminRes = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalisedEmail, password: trimmedPassword })
      });

      if (adminRes.ok) {
        // Master password verified and session cookie set!
        // Also sign in via Better Auth in background if possible
        await signIn.email({
          email: normalisedEmail,
          password: trimmedPassword
        }).catch(() => {});

        setLoading(false);
        router.refresh();
        return;
      }

      // 2. Secondary: If not master password, try standard Better Auth credentials
      const result = await signIn.email({
        email: normalisedEmail,
        password: trimmedPassword
      });

      setLoading(false);

      if (result.error) {
        setError(
          result.error.message === "Email not verified"
            ? "Your account email is not verified."
            : "Invalid administrator email or password."
        );
        return;
      }

      router.refresh();
    } catch {
      setLoading(false);
      setError("An unexpected network error occurred.");
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      setLoading(false);
      router.refresh();
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
            This area is restricted to authorized personnel. Sign in with your administrator credentials.
          </p>
        </div>

        {session?.user && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">
              Signed in as <span className="font-semibold">{session.user.email}</span>
            </p>
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
              This account does not have administrator privileges. Please sign in with an administrator account.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="mt-2 inline-flex items-center gap-1.5 font-medium underline hover:text-amber-950 dark:hover:text-amber-100"
            >
              <LogOut size={12} />
              <span>Sign out of current account</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Input
            id="admin-email"
            type="email"
            label="Administrator Email"
            placeholder="admin@example.com"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <>
                    <EyeOff size={13} />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye size={13} />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-11 w-full rounded-md border border-border bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

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

          <div className="rounded-md bg-muted/60 p-3 text-center text-[11px] text-muted-foreground border border-border/50">
            <span className="font-semibold text-foreground">Master admin password:</span>{" "}
            <code className="rounded bg-background px-1.5 py-0.5 font-mono font-bold text-foreground border border-border">
              elaris-admin-2026
            </code>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Enter any admin email with master password to unlock the dashboard.
            </p>
          </div>

          <div className="mt-1 text-center">
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
