import type { Metadata } from "next";
import { PolicyContent } from "@/components/content/policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy – Elaris",
  description: "Learn how Elaris protects and handles your personal information.",
  alternates: {
    canonical: "/privacy"
  }
};

export default function PrivacyPage() {
  return <PolicyContent title="Privacy Policy" />;
}

