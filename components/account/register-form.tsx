"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { OtpForm } from "@/components/account/otp-form";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const result = await signUp.email({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    if (result.error) {
      setError(
        result.error.message?.includes("already")
          ? "An account with this email already exists."
          : "Something went wrong. Please try again."
      );
      setLoading(false);
      return;
    }

    // Send OTP via our Brevo-backed route
    const otpRes = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });

    setLoading(false);

    if (!otpRes.ok) {
      setError("Account created but failed to send verification code. Try signing in to resend.");
      return;
    }

    setOtpSent(true);
  }

  if (otpSent) {
    return (
      <div className="grid gap-6">
        <div className="text-center">
          <p className="text-sm font-semibold">Check your inbox</p>
          <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code we sent to verify your account.</p>
        </div>
        <OtpForm email={email.trim().toLowerCase()} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Input
        id="register-name"
        label="Full name"
        placeholder="Alex Chen"
        autoComplete="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        id="register-email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id="register-password"
        type="password"
        label="Password"
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint="At least 8 characters."
      />

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? <Spinner size="sm" /> : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
