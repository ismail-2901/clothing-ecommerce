"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Call better-auth's forget-password endpoint directly
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          redirectTo: `${window.location.origin}/reset-password`
        })
      });

      setLoading(false);

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
        <p className="text-sm font-semibold">Reset link sent</p>
        <p className="mt-2 text-sm text-muted-foreground">
          If <strong>{email}</strong> is registered, you'll receive a reset link
          shortly.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Input
        id="forgot-email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint="We'll send a password reset link to this address."
      />

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? <Spinner size="sm" /> : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
