import { prisma } from "@/db/prisma";

export type CatalogVariant = {
  id: string;
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

export type ProductReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorName: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
};

export type ProductReviewSummary = {
  averageRating: number;
  totalCount: number;
  verifiedCount: number;
  reviews: ProductReviewItem[];
};

export type CatalogFilter = {
  category?: string;
  color?: string;
  size?: string;
  q?: string;
  minPrice?: number; // in paisa (smallest unit)
  maxPrice?: number; // in paisa
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


const productInclude = {
  category: true,
  collection: true,
  images: { orderBy: { position: "asc" as const } },
  variants: { where: { deletedAt: null } },
  tags: true
};

function mapDbProductToCatalogProduct(p: any): CatalogProduct {
  const images = p.images.length > 0
    ? p.images.map((img: any) => ({ src: img.url, alt: img.alt || p.name }))
    : [{ src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80", alt: p.name }];

  const rawVariants = p.variants.map((v: any) => ({
    id: v.id,
    sku: v.sku,
    color: v.color,
    size: v.size.trim(),
    price: v.priceOverride ?? p.basePrice,
    compareAtPrice: p.salePrice ?? undefined,
    stock: v.stockQuantity
  }));

  // Expand any legacy comma-combined sizes ("M, L, XL" → 3 entries)
  const expanded = rawVariants.flatMap((v: any) => {
    if (!v.size.includes(",")) return [v];
    return v.size
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map((size: string) => ({ ...v, size }));
  });

  // Deduplicate by color+size (case-insensitive) — keep highest stock entry
  const seen = new Map<string, typeof expanded[0]>();
  for (const v of expanded) {
    const key = `${v.color.trim().toLowerCase()}||${v.size.trim().toLowerCase()}`;
    const existing = seen.get(key);
    if (!existing || v.stock > existing.stock) {
      seen.set(key, v);
    }
  }
  const variants = Array.from(seen.values());

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
    tags: p.tags.map((t: any) => t.name),
    images,
    variants
  };
}

export async function getAllProducts(): Promise<CatalogProduct[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: productInclude,
      orderBy: { createdAt: "desc" }
    });

    return dbProducts.map(mapDbProductToCatalogProduct);
  } catch (err) {
    console.error("[catalog:db]", err);
    return [];
  }
}

export async function getFilteredProducts(filter: CatalogFilter): Promise<CatalogProduct[]> {
  try {
    const where: any = {
      deletedAt: null,
      status: "PUBLISHED"
    };

    if (filter.category) {
      where.category = { slug: filter.category };
    }

    if (filter.size || filter.color) {
      where.variants = {
        some: {
          deletedAt: null,
          ...(filter.size && { size: { contains: filter.size, mode: "insensitive" } }),
          ...(filter.color && { color: { equals: filter.color, mode: "insensitive" } })
        }
      };
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      where.basePrice = {
        ...(filter.minPrice !== undefined && { gte: filter.minPrice }),
        ...(filter.maxPrice !== undefined && { lte: filter.maxPrice })
      };
    }

    if (filter.q?.trim()) {
      const query = filter.q.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { some: { name: { contains: query, mode: "insensitive" } } } }
      ];
    }

    const dbProducts = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" }
    });

    return dbProducts.map(mapDbProductToCatalogProduct);
  } catch (err) {
    console.error("[catalog:getFilteredProducts]", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | undefined> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude
    });

    if (!product || product.deletedAt !== null || product.status !== "PUBLISHED") {
      return undefined;
    }

    return mapDbProductToCatalogProduct(product);
  } catch (err) {
    console.error("[catalog:getProductBySlug]", err);
    return undefined;
  }
}

export async function getProductReviews(productId: string): Promise<ProductReviewSummary> {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isVisible: true,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        verifiedCount: 0,
        reviews: []
      };
    }

    const userIds = reviews
      .map((r) => r.userId)
      .filter((id): id is string => Boolean(id));

    const verifiedUserIds = new Set<string>();

    if (userIds.length > 0) {
      const verifiedOrders = await prisma.orderItem.findMany({
        where: {
          productId,
          order: {
            userId: { in: userIds },
            paymentStatus: "PAID"
          }
        },
        select: {
          order: {
            select: { userId: true }
          }
        }
      });

      for (const item of verifiedOrders) {
        if (item.order?.userId) {
          verifiedUserIds.add(item.order.userId);
        }
      }
    }

    const totalCount = reviews.length;
    const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((sumRating / totalCount).toFixed(1));
    const verifiedCount = reviews.filter(
      (r) => r.userId && verifiedUserIds.has(r.userId)
    ).length;

    const formattedReviews: ProductReviewItem[] = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      authorName: r.user?.name || "Customer",
      createdAt: r.createdAt.toISOString(),
      isVerifiedPurchase: Boolean(r.userId && verifiedUserIds.has(r.userId))
    }));

    return {
      averageRating,
      totalCount,
      verifiedCount,
      reviews: formattedReviews
    };
  } catch (err) {
    console.error("[catalog:reviews]", err);
    return {
      averageRating: 0,
      totalCount: 0,
      verifiedCount: 0,
      reviews: []
    };
  }
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
