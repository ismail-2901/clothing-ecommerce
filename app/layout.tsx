import type { Metadata, Viewport } from "next";
import "./globals.css";
import { storeConfig } from "@/config/store";

export const metadata: Metadata = {
  metadataBase: new URL(storeConfig.url),
  title: {
    default: storeConfig.name,
    template: `%s | ${storeConfig.name}`
  },
  description: storeConfig.description,
  openGraph: {
    title: storeConfig.name,
    description: storeConfig.description,
    type: "website",
    locale: storeConfig.locale
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

