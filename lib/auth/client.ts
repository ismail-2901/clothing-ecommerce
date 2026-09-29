"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword
} = authClient;

// Which social providers are configured (set at build time via env)
export const SOCIAL_PROVIDERS = {
  google: !!(process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true"),
  apple: !!(process.env.NEXT_PUBLIC_APPLE_ENABLED === "true")
} as const;
