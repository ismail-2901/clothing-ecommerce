import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { SUBCATEGORY_METADATA } from "./catalog-data-definitions";
import { WOMEN_PRODUCTS } from "./data/women-catalog";
import { MEN_PRODUCTS } from "./data/men-catalog";
import { ACCESSORIES_PRODUCTS } from "./data/accessories-catalog";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running seed-full-catalog");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting Full Catalog Population...");

  // 1. Ensure current-collection exists
  const collection = await prisma.collection.upsert({
    where: { slug: "current-collection" },
    update: {},
    create: {
      name: "Current Collection",
      slug: "current-collection",
      description: "Elaris curated collection."
    }
  });

  // 2. Update subcategory metadata (banner images, descriptions)
  console.log("📁 Updating 20 subcategories with curated metadata and banner images...");
  for (const [slug, meta] of Object.entries(SUBCATEGORY_METADATA)) {
    await prisma.category.updateMany({
      where: { slug },
      data: {
        imageUrl: meta.image,
        description: meta.description,
        deletedAt: null
      }
    });
  }

  // Also update parent categories banner images if not set
  await prisma.category.updateMany({
    where: { slug: "women" },
    data: {
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      description: "Contemporary women's collection spanning artisanal sarees, fine tailoring, and modern silhouettes."
    }
  });
  await prisma.category.updateMany({
    where: { slug: "men" },
    data: {
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
      description: "Discerning menswear featuring heritage panjabis, Italian wool blazers, and clean daily essentials."
    }
  });
  await prisma.category.updateMany({
    where: { slug: "accessories" },
    data: {
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
      description: "Artisanal leather goods, precision timepieces, and handwoven silk stoles."
    }
  });

  // Fetch category lookup map
  const categories = await prisma.category.findMany({
    where: { deletedAt: null }
  });
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat.slug, cat.id);
  }

  const allProducts = [...WOMEN_PRODUCTS, ...MEN_PRODUCTS, ...ACCESSORIES_PRODUCTS];
  console.log(`📦 Seeding ${allProducts.length} total products across 20 subcategories...`);

  let count = 0;
  for (const item of allProducts) {
    const categoryId = categoryMap.get(item.subCategorySlug);
    if (!categoryId) {
      throw new Error(`Category not found for slug: ${item.subCategorySlug}`);
    }

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        categoryId,
        collectionId: collection.id,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        salePrice: item.salePrice ?? null,
        material: item.material,
        careInstructions: item.careInstructions,
        status: ProductStatus.PUBLISHED,
        deletedAt: null
      },
      create: {
        categoryId,
        collectionId: collection.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        basePrice: item.basePrice,
        salePrice: item.salePrice ?? null,
        material: item.material,
        careInstructions: item.careInstructions,
        status: ProductStatus.PUBLISHED
      }
    });

    // Upsert primary image
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id, position: 0 }
    });

    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: {
          url: item.imageUrl,
          alt: item.name,
          storageKey: `seed/${item.slug}.jpg`
        }
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          storageKey: `seed/${item.slug}.jpg`,
          url: item.imageUrl,
          alt: item.name,
          position: 0
        }
      });
    }

    // Upsert variants
    for (const v of item.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          color: v.color,
          size: v.size,
          stockQuantity: v.stockQuantity,
          isAvailable: v.stockQuantity > 0,
          deletedAt: null
        },
        create: {
          productId: product.id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          stockQuantity: v.stockQuantity,
          isAvailable: v.stockQuantity > 0
        }
      });
    }

    // Upsert tags
    for (const tag of item.tags) {
      await prisma.productTag.upsert({
        where: {
          productId_name: {
            productId: product.id,
            name: tag
          }
        },
        update: {},
        create: {
          productId: product.id,
          name: tag
        }
      });
    }

    count++;
    if (count % 20 === 0) {
      console.log(`  ✓ Seeded ${count}/${allProducts.length} products...`);
    }
  }

  console.log(`\n🎉 Successfully populated full catalog of ${allProducts.length} products!`);

  // Print summary breakdown from database
  const subcategoryCounts = await prisma.category.findMany({
    where: { parentId: { not: null }, deletedAt: null },
    include: {
      parent: { select: { name: true } },
      _count: {
        select: {
          products: {
            where: { status: ProductStatus.PUBLISHED, deletedAt: null }
          }
        }
      }
    },
    orderBy: [
      { parentId: "asc" },
      { position: "asc" }
    ]
  });

  console.log("\n📊 Final Subcategory Breakdown:");
  for (const cat of subcategoryCounts) {
    console.log(`  - [${cat.parent?.name}] ${cat.name} (${cat.slug}): ${cat._count.products} products`);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

