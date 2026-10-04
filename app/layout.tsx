import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { storeConfig } from "@/config/store";

// P3/M5: next/font self-hosts Inter — eliminates render-blocking cross-origin <link>,
// removes FOUT, and avoids the external DNS lookup on every cold load.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter"
});

function getMetadataBase(): URL {
  try {
    return new URL(storeConfig.url);
  } catch {
    return new URL("https://elarisstore.com");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
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
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

