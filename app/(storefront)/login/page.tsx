"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { LoginForm } from "@/components/account/login-form";
import { signIn } from "@/lib/auth/client";

export default function LoginPage() {
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);

  const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_ENABLED;
  const githubEnabled = !!process.env.NEXT_PUBLIC_GITHUB_ENABLED;

  async function handleSocialLogin(provider: "google" | "github") {
    setSocialLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/account"
      });
    } catch {
      setSocialLoading(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-140px)] grid lg:grid-cols-2">
      {/* Left Editorial Visual Banner */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-zinc-900 text-white">
        <Image
          src="/elaris-hero.jpg"
          alt="ELARIS Editorial"
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-black tracking-[0.2em] uppercase">
            ELARIS
          </Link>
          <p className="text-xs tracking-wider text-zinc-300 mt-1">
            More Than Clothing.
          </p>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-xs">
            Conscious Luxury
          </span>
          <h2 className="font-serif text-3xl xl:text-4xl font-light italic leading-tight">
            &ldquo;Wear Your Story. Fashion created with patience, conscience, and purposeful design.&rdquo;
          </h2>
          <p className="text-xs text-zinc-400">
            Dhaka &bull; Nationwide Delivery &bull; 7-Day Hassle-Free Returns
          </p>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Customer Portal
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Enter your credentials to manage your orders and saved wardrobe.
            </p>
          </div>

          {/* Social Quick Sign-In */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!googleEnabled || socialLoading !== null}
              onClick={() => handleSocialLogin("google")}
              title={!googleEnabled ? "Google sign-in not configured" : "Sign in with Google"}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted/40 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === "google" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              type="button"
              disabled={!githubEnabled || socialLoading !== null}
              onClick={() => handleSocialLogin("github")}
              title={!githubEnabled ? "GitHub sign-in not configured" : "Sign in with GitHub"}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted/40 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === "github" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Or with email
            </span>
          </div>

          <Suspense fallback={<div className="h-48 animate-pulse bg-muted/20 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
