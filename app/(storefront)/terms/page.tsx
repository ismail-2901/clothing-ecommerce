import type { Metadata } from "next";
import { PolicyContent } from "@/components/content/policy-content";

export const metadata: Metadata = {
  title: "Terms and Conditions – Elaris",
  description: "Terms and conditions governing purchases and usage of Elaris.",
  alternates: {
    canonical: "/terms"
  }
};

export default function TermsPage() {
  return <PolicyContent title="Terms and Conditions" />;
}

