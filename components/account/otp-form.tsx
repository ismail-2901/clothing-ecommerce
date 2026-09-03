"use client";

import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface OtpFormProps {
  email: string;
}

const COOLDOWN_SECONDS = 60;

export function OtpForm({ email }: OtpFormProps) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit() {
    const code = digits.join("");
    if (code.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Verification failed.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    setResendCooldown(COOLDOWN_SECONDS);

    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to resend code.");
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
        <p className="text-sm font-semibold text-green-600">Email verified!</p>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        We sent a 6-digit code to <strong className="text-foreground">{email}</strong>. It expires in 15 minutes.
      </div>

      {/* Digit inputs */}
      <div className="flex justify-center gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="h-12 w-10 rounded-md border border-border bg-background text-center text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full">
        {loading ? <Spinner size="sm" /> : "Verify email"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="font-semibold text-foreground underline underline-offset-4 disabled:opacity-50"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </p>
    </div>
  );
}
