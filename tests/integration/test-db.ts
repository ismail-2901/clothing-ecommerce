import net from "node:net";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export const TEST_PORT = 15432;
export const TEST_DB_NAME = "ateliercommerce_test";
export const TEST_DATABASE_URL = `postgresql://postgres:password@127.0.0.1:${TEST_PORT}/${TEST_DB_NAME}?schema=public`;

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.DIRECT_URL = TEST_DATABASE_URL;

let prismaInstance: PrismaClient | null = null;

function isPortListening(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function ensureTestDatabase(): Promise<PrismaClient> {
  const isListening = await isPortListening(TEST_PORT);
  if (!isListening) {
    const { default: EmbeddedPostgres } = await import("embedded-postgres");
    const pg = new EmbeddedPostgres({
      databaseDir: "./.test-pg-data",
      user: "postgres",
      password: "password",
      port: TEST_PORT,
      persistent: true
    });

    if (!fs.existsSync("./.test-pg-data")) {
      await pg.initialise();
    }
    await pg.start();
    try {
      await pg.createDatabase(TEST_DB_NAME);
    } catch {
      // Database already exists
    }

    execSync("npx prisma migrate deploy", {
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL,
        DIRECT_URL: TEST_DATABASE_URL
      },
      encoding: "utf8"
    });
  }

  if (!prismaInstance) {
    const adapter = new PrismaPg({ connectionString: TEST_DATABASE_URL });
    prismaInstance = new PrismaClient({ adapter });
    await prismaInstance.$connect();

    // Ensure schema alignment with schema.prisma for test DB
    await prismaInstance.$executeRawUnsafe(`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestToken" TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS "Order_guestToken_key" ON "Order"("guestToken");
    `);
  }

  return prismaInstance;
}

export async function cleanupDatabase(prisma: PrismaClient) {
  // Clear tables in reverse dependency order
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "CartItem", "Cart",
      "OrderStatusHistory", "OrderItem", "Payment", "InventoryMovement", "Order",
      "Review", "WishlistItem", "Wishlist",
      "ProductVariant", "ProductImage", "ProductTag", "Product", "Category",
      "Coupon", "UserRole", "RolePermission", "Permission", "Role", "user"
    CASCADE;
  `);
}

export async function seedCatalogFixture(prisma: PrismaClient) {
  const category = await prisma.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
      description: "Apparel category"
    }
  });

  const product = await prisma.product.create({
    data: {
      name: "Signature Oxford Shirt",
      slug: "signature-oxford-shirt",
      description: "Classic premium cotton oxford shirt",
      basePrice: 250000, // 2500 BDT in paisa
      status: "PUBLISHED",
      categoryId: category.id
    }
  });

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: "OXF-WHT-M",
      color: "White",
      size: "M",
      stockQuantity: 10,
      reservedQuantity: 0,
      isAvailable: true
    }
  });

  return { category, product, variant };
}

export async function seedCouponFixture(prisma: PrismaClient) {
  const activePercentCoupon = await prisma.coupon.create({
    data: {
      code: "SAVE10",
      title: "10% Discount",
      type: "PERCENTAGE",
      value: 10,
      minSubtotal: 100000, // 1000 BDT
      usageLimit: 100,
      usageCount: 0,
      status: "ACTIVE"
    }
  });

  const singleUseCoupon = await prisma.coupon.create({
    data: {
      code: "ONCEONLY",
      title: "Single Use Coupon",
      type: "FIXED_AMOUNT",
      value: 50000, // 500 BDT
      usageLimit: 1,
      usageCount: 0,
      status: "ACTIVE"
    }
  });

  const expiredCoupon = await prisma.coupon.create({
    data: {
      code: "EXPIRED20",
      title: "Expired 20%",
      type: "PERCENTAGE",
      value: 20,
      endsAt: new Date(Date.now() - 86400000), // yesterday
      status: "ACTIVE"
    }
  });

  return { activePercentCoupon, singleUseCoupon, expiredCoupon };
}

export async function seedUserFixture(prisma: PrismaClient) {
  const customer = await prisma.user.create({
    data: {
      id: "cust-" + Math.random().toString(36).substring(2, 9),
      name: "Customer User",
      email: `customer-${Date.now()}@example.com`,
      emailVerified: true
    }
  });

  const otherCustomer = await prisma.user.create({
    data: {
      id: "cust2-" + Math.random().toString(36).substring(2, 9),
      name: "Other User",
      email: `other-${Date.now()}@example.com`,
      emailVerified: true
    }
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    create: { name: "ADMIN", description: "Administrator" },
    update: {}
  });

  const adminUser = await prisma.user.create({
    data: {
      id: "admin-" + Math.random().toString(36).substring(2, 9),
      name: "Admin User",
      email: `admin-${Date.now()}@example.com`,
      emailVerified: true,
      roles: {
        create: {
          roleId: adminRole.id
        }
      }
    }
  });

  return { customer, otherCustomer, adminUser, adminRole };
}
