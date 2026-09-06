"use client";

import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/account/login-form";

export default function LoginPage() {
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
              onClick={() => alert("Google Sign-in initialized.")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted/40 transition shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Apple Sign-in initialized.")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted/40 transition shadow-xs"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.04-.51 2.66-1.26z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Or with email
            </span>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
