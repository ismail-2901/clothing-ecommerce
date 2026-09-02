import type { Metadata } from "next";
import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = {
  title: "Sign In – Elaris",
  description: "Sign in to your Elaris account."
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage orders, wishlist, and preferences.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
