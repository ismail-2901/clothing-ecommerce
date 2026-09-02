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

const products: CatalogProduct[] = [
  {
    id: "prod_black_linen_shirt",
    name: "Black Linen Shirt",
    slug: "black-linen-shirt",
    category: "Men",
    categorySlug: "men",
    collection: "Current Collection",
    description:
      "A breathable black shirt with a relaxed collar, clean placket, and light structure for warm evenings.",
    material: "55% linen, 45% cotton",
    care: "Machine wash cold, line dry, warm iron if needed.",
    tags: ["shirt", "black", "linen", "summer", "smart casual"],
    images: [
      {
        src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        alt: "Model wearing a black shirt"
      },
      {
        src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        alt: "Black shirt styling detail"
      }
    ],
    variants: [
      { sku: "ALS-BLK-S", color: "black", size: "S", price: 245000, compareAtPrice: 290000, stock: 8 },
      { sku: "ALS-BLK-M", color: "black", size: "M", price: 245000, compareAtPrice: 290000, stock: 5 },
      { sku: "ALS-BLK-L", color: "black", size: "L", price: 245000, compareAtPrice: 290000, stock: 0 }
    ]
  },
  {
    id: "prod_sculpted_black_dress",
    name: "Sculpted Black Dress",
    slug: "sculpted-black-dress",
    category: "Women",
    categorySlug: "women",
    collection: "Evening Edit",
    description:
      "A clean evening dress with a sculpted neckline, soft drape, and minimal seam detailing.",
    material: "Modal blend with stretch lining",
    care: "Dry clean recommended.",
    tags: ["dress", "black", "party", "evening", "minimal"],
    images: [
      {
        src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
        alt: "Black evening dress"
      },
      {
        src: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1200&q=80",
        alt: "Dress fabric detail"
      }
    ],
    variants: [
      { sku: "SBD-BLK-XS", color: "black", size: "XS", price: 395000, stock: 3 },
      { sku: "SBD-BLK-S", color: "black", size: "S", price: 395000, stock: 7 },
      { sku: "SBD-BLK-M", color: "black", size: "M", price: 395000, stock: 4 }
    ]
  },
  {
    id: "prod_oversized_cotton_tee",
    name: "Oversized Cotton Tee",
    slug: "oversized-cotton-tee",
    category: "Essentials",
    categorySlug: "essentials",
    collection: "Core Wardrobe",
    description:
      "A heavyweight cotton tee with a generous fit, refined neckline, and soft hand feel.",
    material: "100% compact cotton jersey",
    care: "Machine wash inside out with similar colors.",
    tags: ["tee", "white", "black", "casual", "oversized"],
    images: [
      {
        src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        alt: "White oversized cotton tee"
      },
      {
        src: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
        alt: "Cotton tee outfit"
      }
    ],
    variants: [
      { sku: "OCT-WHT-S", color: "white", size: "S", price: 145000, stock: 18 },
      { sku: "OCT-WHT-M", color: "white", size: "M", price: 145000, stock: 16 },
      { sku: "OCT-BLK-M", color: "black", size: "M", price: 145000, stock: 12 },
      { sku: "OCT-BLK-L", color: "black", size: "L", price: 145000, stock: 9 }
    ]
  },
  {
    id: "prod_tailored_trouser",
    name: "Tailored Trouser",
    slug: "tailored-trouser",
    category: "Essentials",
    categorySlug: "essentials",
    collection: "Work Edit",
    description:
      "A straight-leg trouser with a clean waistband, subtle taper, and crisp drape.",
    material: "Recycled poly-viscose blend",
    care: "Machine wash gentle, hang to dry.",
    tags: ["trouser", "charcoal", "formal", "work", "tailored"],
    images: [
      {
        src: "https://images.unsplash.com/photo-1506629905607-d9d297d30c3f?auto=format&fit=crop&w=1200&q=80",
        alt: "Tailored trousers"
      },
      {
        src: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80",
        alt: "Tailored outfit"
      }
    ],
    variants: [
      { sku: "TTR-CHR-S", color: "charcoal", size: "S", price: 275000, stock: 4 },
      { sku: "TTR-CHR-M", color: "charcoal", size: "M", price: 275000, stock: 6 },
      { sku: "TTR-BLK-M", color: "black", size: "M", price: 285000, stock: 3 }
    ]
  }
];

const categories = [
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

const offers = [
  {
    title: "Current collection launch",
    summary: "Save on selected launch pieces while inventory is available.",
    code: "LAUNCH10"
  },
  {
    title: "Free delivery threshold",
    summary: "Configurable free delivery rule for eligible local orders.",
    code: "SHIPFREE"
  }
];

export function getCatalogHighlights() {
  return {
    hero: {
      kicker: "Single-brand clothing commerce",
      title: "A sharper way to shop essentials.",
      copy: "Minimal, fast, and ready for real inventory, grounded AI assistance, checkout, admin operations, and production integrations.",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Clothing store interior with curated fashion pieces"
    },
    categories,
    offers,
    curatedProducts: products
  };
}

export function getFilteredProducts(filter: CatalogFilter) {
  return products.filter((product) => {
    const matchesCategory = filter.category
      ? product.categorySlug === filter.category
      : true;
    const matchesColor = filter.color
      ? product.variants.some((variant) => variant.color === filter.color)
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

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getAllProducts() {
  return products;
}

