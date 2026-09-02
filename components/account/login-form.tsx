"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn.email({
      email: email.trim().toLowerCase(),
      password
    });

    setLoading(false);

    if (result.error) {
      setError(
        result.error.message === "Email not verified"
          ? "Check your inbox and verify your email before signing in."
          : "Invalid email or password."
      );
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Input
        id="login-email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? <Spinner size="sm" /> : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
