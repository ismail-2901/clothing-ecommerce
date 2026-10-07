import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account – Elaris",
  description: "Create an Elaris account to unlock exclusive member privileges.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
