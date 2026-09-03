import { prisma } from "@/db/prisma";

export type CatalogVariant = {
  sku: string;
  color: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  collection: string;
  description: string;
  material: string;
  care: string;
  tags: string[];
  images: Array<{
    src: string;
    alt: string;
  }>;
  variants: CatalogVariant[];
};

export type CatalogFilter = {
  category?: string;
  color?: string;
  size?: string;
  q?: string;
};

const defaultCategories = [
  {
    name: "Men",
    slug: "men",
    image:
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Women",
    slug: "women",
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Essentials",
    slug: "essentials",
    image:
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1200&q=80"
  }
];

const defaultOffers = [
  {
    title: "Welcome offer",
    summary: "Sign up and get savings on your first purchase.",
    code: "WELCOME10"
  },
  {
    title: "Free delivery threshold",
    summary: "Free delivery for eligible orders across Bangladesh.",
    code: "SHIPFREE"
  }
];

export async function getAllProducts(): Promise<CatalogProduct[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: {
        category: true,
        collection: true,
        images: { orderBy: { position: "asc" } },
        variants: { where: { deletedAt: null } },
        tags: true
      },
      orderBy: { createdAt: "desc" }
    });

    return dbProducts.map((p) => {
      const images = p.images.length > 0
        ? p.images.map((img) => ({ src: img.url, alt: img.alt || p.name }))
        : [{ src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80", alt: p.name }];

      const variants = p.variants.map((v) => ({
        sku: v.sku,
        color: v.color,
        size: v.size,
        price: v.priceOverride ?? p.basePrice,
        compareAtPrice: p.salePrice ?? undefined,
        stock: v.stockQuantity
      }));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name || "Clothing",
        categorySlug: p.category?.slug || "clothing",
        collection: p.collection?.name || "General",
        description: p.description,
        material: p.material || "",
        care: p.careInstructions || "",
        tags: p.tags.map((t) => t.name),
        images,
        variants
      };
    });
  } catch (err) {
    console.error("[catalog:db]", err);
    return [];
  }
}

export async function getFilteredProducts(filter: CatalogFilter): Promise<CatalogProduct[]> {
  const products = await getAllProducts();
  return products.filter((product) => {
    const matchesCategory = filter.category
      ? product.categorySlug === filter.category
      : true;
    const matchesColor = filter.color
      ? product.variants.some((variant) => variant.color.toLowerCase() === filter.color?.toLowerCase())
      : true;
    const matchesSize = filter.size
      ? product.variants.some((variant) => variant.size.toLowerCase() === filter.size?.toLowerCase())
      : true;
    const query = filter.q?.trim().toLowerCase();
    const matchesQuery = query
      ? [product.name, product.description, product.category, product.collection, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchesCategory && matchesColor && matchesSize && matchesQuery;
  });
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | undefined> {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug);
}

export async function getCatalogHighlights() {
  const products = await getAllProducts();
  return {
    hero: {
      kicker: "Single-brand clothing commerce",
      title: "A sharper way to shop essentials.",
      copy: "Minimal, fast, and ready for real inventory, grounded AI assistance, checkout, admin operations, and production integrations.",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Clothing store interior with curated fashion pieces"
    },
    categories: defaultCategories,
    offers: defaultOffers,
    curatedProducts: products
  };
}
