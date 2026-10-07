import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In – Elaris",
  description: "Sign in to your Elaris account to manage orders and saved items.",
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
