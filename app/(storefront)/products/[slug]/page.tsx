import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/product-detail";
import { getProductBySlug } from "@/features/catalog/data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://elarisstore.com";
const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Elaris";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const formattedPrice = (minPrice / 100).toFixed(2);
  const title = `${product.name} — ${BRAND_NAME}`;
  const description = product.description.slice(0, 155);
  const image = product.images[0]?.src;
  const url = `${APP_URL}/products/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      ...(image ? { images: [{ url: image, alt: product.images[0].alt }] } : {})
    },
    other: {
      "product:price:amount": formattedPrice,
      "product:price:currency": "BDT"
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const inStock = product.variants.some((v) => v.stock > 0);
  const url = `${APP_URL}/products/${slug}`;
  const image = product.images[0]?.src;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url,
    ...(image ? { image } : {}),
    brand: { "@type": "Brand", name: BRAND_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BDT",
      price: (minPrice / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: BRAND_NAME }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}

