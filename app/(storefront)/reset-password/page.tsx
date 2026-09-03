import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account/reset-password-form";

export const metadata: Metadata = {
  title: "Set New Password – Elaris",
  description: "Set a new password for your account."
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Set new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
