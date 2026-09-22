import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductStatus, RoleName } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running seed");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


async function main() {
  const roles = await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `${name.toLowerCase().replace("_", " ")} role`
        }
      })
    )
  );

  const permissions = [
    "profile:manage_own",
    "cart:manage_own",
    "order:create",
    "order:read_own",
    "product:manage",
    "inventory:manage",
    "order:manage",
    "offer:manage",
    "customer:read",
    "risk:review",
    "admin:manage",
    "role:manage",
    "audit:read",
    "system:configure"
  ];

  const permissionRows = await Promise.all(
    permissions.map((action) =>
      prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action }
      })
    )
  );

  const superAdminRole = roles.find((role) => role.name === "SUPER_ADMIN");
  if (superAdminRole) {
    await Promise.all(
      permissionRows.map((permission) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: superAdminRole.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          }
        })
      )
    );
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      "SEED_ADMIN_PASSWORD env var is required to seed the admin account. Set it in .env and do not commit its value."
    );
  }
  const hashedPassword = await hashPassword(adminPassword);


  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { emailVerified: true },
    create: {
      name: "Seed Admin",
      email: adminEmail,
      emailVerified: true
    }
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: admin.id
      }
    },
    update: {
      password: hashedPassword
    },
    create: {
      userId: admin.id,
      accountId: admin.id,
      providerId: "credential",
      password: hashedPassword
    }
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: superAdminRole.id
      }
    });
  }

  const standardCategories = [
    { name: "Women", slug: "women", position: 1 },
    { name: "Men", slug: "men", position: 2 },
    { name: "Tops", slug: "tops", position: 3 },
    { name: "Dresses", slug: "dresses", position: 4 },
    { name: "Outerwear", slug: "outerwear", position: 5 },
    { name: "Bottoms", slug: "bottoms", position: 6 },
    { name: "Activewear", slug: "activewear", position: 7 },
    { name: "Accessories", slug: "accessories", position: 8 },
    { name: "Essentials", slug: "essentials", position: 9 },
  ];

  for (const cat of standardCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { position: cat.position },
      create: { name: cat.name, slug: cat.slug, position: cat.position },
    });
  }

  const men = await prisma.category.findUniqueOrThrow({ where: { slug: "men" } });
  const women = await prisma.category.findUniqueOrThrow({ where: { slug: "women" } });

  const collection = await prisma.collection.upsert({
    where: { slug: "current-collection" },
    update: {},
    create: {
      name: "Current Collection",
      slug: "current-collection",
      description: "Minimal premium clothing for the launch catalog."
    }
  });

  await createProduct({
    categoryId: men.id,
    collectionId: collection.id,
    name: "Black Linen Shirt",
    slug: "black-linen-shirt",
    description: "A breathable black shirt with a relaxed collar and clean placket.",
    basePrice: 245000,
    material: "55% linen, 45% cotton",
    careInstructions: "Machine wash cold, line dry.",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ALS-BLK-S", color: "black", size: "S", stockQuantity: 8 },
      { sku: "ALS-BLK-M", color: "black", size: "M", stockQuantity: 5 },
      { sku: "ALS-BLK-L", color: "black", size: "L", stockQuantity: 0 }
    ],
    tags: ["shirt", "black", "linen", "summer"]
  });

  await createProduct({
    categoryId: women.id,
    collectionId: collection.id,
    name: "Sculpted Black Dress",
    slug: "sculpted-black-dress",
    description: "A clean evening dress with a sculpted neckline and soft drape.",
    basePrice: 395000,
    material: "Modal blend with stretch lining",
    careInstructions: "Dry clean recommended.",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SBD-BLK-XS", color: "black", size: "XS", stockQuantity: 3 },
      { sku: "SBD-BLK-S", color: "black", size: "S", stockQuantity: 7 },
      { sku: "SBD-BLK-M", color: "black", size: "M", stockQuantity: 4 }
    ],
    tags: ["dress", "black", "party", "evening"]
  });

  await prisma.coupon.upsert({
    where: { code: "LAUNCH10" },
    update: {},
    create: {
      code: "LAUNCH10",
      title: "Current collection launch",
      type: "PERCENTAGE",
      value: 10,
      minSubtotal: 150000
    }
  });

  await prisma.storeSetting.upsert({
    where: { key: "currency" },
    update: { value: "BDT" },
    create: { key: "currency", value: "BDT" }
  });
}

async function createProduct(input: {
  categoryId: string;
  collectionId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  material: string;
  careInstructions: string;
  imageUrl: string;
  variants: Array<{ sku: string; color: string; size: string; stockQuantity: number }>;
  tags: string[];
}) {
  const product = await prisma.product.upsert({
    where: { slug: input.slug },
    update: {},
    create: {
      categoryId: input.categoryId,
      collectionId: input.collectionId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      basePrice: input.basePrice,
      material: input.material,
      careInstructions: input.careInstructions,
      status: ProductStatus.PUBLISHED
    }
  });

  await prisma.productImage.create({
    data: {
      productId: product.id,
      storageKey: `seed/${input.slug}.jpg`,
      url: input.imageUrl,
      alt: input.name,
      position: 0
    }
  });

  await Promise.all(
    input.variants.map((variant) =>
      prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {},
        create: {
          productId: product.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          stockQuantity: variant.stockQuantity
        }
      })
    )
  );

  await Promise.all(
    input.tags.map((name) =>
      prisma.productTag.upsert({
        where: {
          productId_name: {
            productId: product.id,
            name
          }
        },
        update: {},
        create: {
          productId: product.id,
          name
        }
      })
    )
  );
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
