"use client";

import dynamic from "next/dynamic";

// Lazy-load FloatingAssistant in a Client Component — ssr:false is only
// allowed inside "use client" boundaries in Next.js 16+ (Turbopack).
const FloatingAssistant = dynamic(
  () => import("@/components/ai/floating-assistant").then((m) => ({ default: m.FloatingAssistant })),
  { ssr: false }
);

export function FloatingAssistantLazy() {
  return <FloatingAssistant />;
}

