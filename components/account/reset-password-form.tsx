"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
        <p className="text-sm font-semibold text-danger">Invalid or missing reset token.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please request a new password reset link.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
        <p className="text-sm font-semibold text-success">Password reset successful</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Button
          className="mt-4 w-full"
          onClick={() => router.push("/login")}
        >
          Sign in
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: password,
          token
        })
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.error || "Failed to reset password. The link may have expired.");
        return;
      }

      setSuccess(true);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Input
        id="reset-password"
        type="password"
        label="New password"
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint="At least 8 characters."
      />

      <Input
        id="reset-password-confirm"
        type="password"
        label="Confirm new password"
        placeholder="Re-enter password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? <Spinner size="sm" /> : "Reset password"}
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

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
