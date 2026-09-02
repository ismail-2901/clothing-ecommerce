import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/register-form";

export const metadata: Metadata = {
  title: "Create Account – Atelier Commerce",
  description: "Create your Atelier Commerce account."
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Shop faster, track orders, and save your wishlist.
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
