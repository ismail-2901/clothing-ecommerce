import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – Elaris",
  description: "Get in touch with the Elaris team for customer support, inquiries, and orders.",
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
