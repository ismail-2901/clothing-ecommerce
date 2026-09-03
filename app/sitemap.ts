import type { MetadataRoute } from "next";
import { getAllProducts, getCatalogHighlights } from "@/features/catalog/data";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://elarisstore.com");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const { categories } = await getCatalogHighlights();

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/offers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 }
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${APP_URL}/shop?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${APP_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
