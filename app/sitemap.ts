import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/db/prisma";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://elarisstore.com");

export const revalidate = 86400; // 24 hours

const getProductSlugs = unstable_cache(
  async () => {
    try {
      return await prisma.product.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" }
      });
    } catch {
      return [];
    }
  },
  ["sitemap-product-slugs"],
  { revalidate: 86400, tags: ["sitemap"] }
);

const getCategories = unstable_cache(
  async () => {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { products: { some: { status: "PUBLISHED", deletedAt: null } } },
        select: { slug: true, updatedAt: true }
      });
      if (dbCategories && dbCategories.length > 0) {
        return dbCategories;
      }
    } catch {
      // Fallback for build or offline environments
    }
    return [
      { slug: "men", updatedAt: new Date() },
      { slug: "women", updatedAt: new Date() },
      { slug: "essentials", updatedAt: new Date() }
    ];
  },
  ["sitemap-category-slugs"],
  { revalidate: 86400, tags: ["sitemap"] }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProductSlugs(),
    getCategories()
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${APP_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
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
    lastModified: cat.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${APP_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
