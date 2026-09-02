import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/account/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password – Elaris",
  description: "Request a password reset link."
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send a secure reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
