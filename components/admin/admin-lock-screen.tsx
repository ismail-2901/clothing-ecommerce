"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck, LogOut } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password
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

          <Input
            id="admin-password"
            type="password"
            label="Password"
            required
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
