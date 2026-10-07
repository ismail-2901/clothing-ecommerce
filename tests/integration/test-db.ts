import fs from "node:fs";
import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export const TEST_PORT = 15432;
export const TEST_DB_NAME = "ateliercommerce_test";
export const TEST_DATABASE_URL = `postgresql://postgres:password@127.0.0.1:${TEST_PORT}/${TEST_DB_NAME}?schema=public`;

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.DIRECT_URL = TEST_DATABASE_URL;

// Supply a deterministic test-only secret so lib/auth/auth.ts can load.
// This value is never used outside the test environment.
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET =
    "test-only-secret-do-not-use-in-production-must-be-32-chars-min";
}

let prismaInstance: PrismaClient | null = null;
let pgServerInstance: any = null;

/**
 * Checks whether PostgreSQL is accepting SQL queries on the specified port.
 */
export async function isPostgresQueryable(
  port: number = TEST_PORT,
  timeoutMs = 1_000
): Promise<boolean> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    host: "127.0.0.1",
    port,
    user: "postgres",
    password: "password",
    database: "postgres",
    connectionTimeoutMillis: timeoutMs,
    idleTimeoutMillis: 500,
    max: 1
  });
  try {
    await pool.query("SELECT 1");
    await pool.end();
    return true;
  } catch {
    await pool.end().catch(() => {});
    return false;
  }
}

/**
 * Polls PostgreSQL with a real SELECT 1 query until the server is fully ready
 * to accept connections — not just TCP-bound.
 *
 * PostgreSQL binds the port before completing WAL recovery and checkpoint sync,
 * so a TCP-only check succeeds 2-4 seconds before the server can actually serve queries.
 * This polling loop bridges that gap with bounded retries and informative diagnostic errors.
 *
 * @param port       TCP port to probe (default TEST_PORT)
 * @param timeoutMs  Total wait budget in ms (default 25 000)
 * @param intervalMs Delay between retry attempts in ms (default 250)
 */
export async function waitUntilQueryable(
  port: number = TEST_PORT,
  timeoutMs = 25_000,
  intervalMs = 250
): Promise<void> {
  const { Pool } = await import("pg");
  const deadline = Date.now() + timeoutMs;
  let lastError = "unknown error";

  while (Date.now() < deadline) {
    const pool = new Pool({
      host: "127.0.0.1",
      port,
      user: "postgres",
      password: "password",
      database: "postgres",
      connectionTimeoutMillis: 1_000,
      idleTimeoutMillis: 500,
      max: 1
    });
    try {
      await pool.query("SELECT 1");
      await pool.end();
      return; // PG is accepting SQL queries
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    } finally {
      await pool.end().catch(() => {});
    }
    await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `PostgreSQL on 127.0.0.1:${port} did not become queryable within ` +
    `${timeoutMs}ms. Last diagnostic error: ${lastError}`
  );
}

/**
 * Starts the embedded PostgreSQL server process once, waits until it is fully queryable,
 * creates the test database if needed, and applies migrations.
 */
export async function startTestDatabase(): Promise<void> {
  const ready = await isPostgresQueryable(TEST_PORT, 1_000);
  if (ready) {
    return;
  }

  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  pgServerInstance = new EmbeddedPostgres({
    databaseDir: "./.test-pg-data",
    user: "postgres",
    password: "password",
    port: TEST_PORT,
    persistent: true
  });

  if (!fs.existsSync("./.test-pg-data")) {
    await pgServerInstance.initialise();
  }
  await pgServerInstance.start();

  // Bounded readiness polling using real SELECT 1 queries
  await waitUntilQueryable(TEST_PORT, 25_000, 250);

  // Ensure test database exists
  const { Client } = await import("pg");
  const adminClient = new Client({
    host: "127.0.0.1",
    port: TEST_PORT,
    user: "postgres",
    password: "password",
    database: "postgres"
  });
  await adminClient.connect();
  try {
    const res = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [TEST_DB_NAME]
    );
    if (res.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
    }
  } finally {
    await adminClient.end().catch(() => {});
  }

  // Deploy migrations to ensure test database schema matches Prisma schema
  try {
    execSync("npx prisma migrate deploy", {
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL,
        DIRECT_URL: TEST_DATABASE_URL
      },
      encoding: "utf8",
      stdio: "pipe"
    });
  } catch (err: any) {
    const errorMsg = err.stderr || err.stdout || err.message;
    throw new Error(`Prisma migration deployment failed against test database:\n${errorMsg}`);
  }
}

/**
 * Shuts down the embedded PostgreSQL server process if it was started in this process.
 */
export async function stopTestDatabase(): Promise<void> {
  if (pgServerInstance) {
    try {
      await pgServerInstance.stop();
    } catch {
      // Best-effort cleanup
    }
    pgServerInstance = null;
  }
}

export async function ensureTestDatabase(): Promise<PrismaClient> {
  const ready = await isPostgresQueryable(TEST_PORT, 1_000);
  if (!ready) {
    await startTestDatabase();
  }

  if (!prismaInstance) {
    const adapter = new PrismaPg({ connectionString: TEST_DATABASE_URL });
    prismaInstance = new PrismaClient({ adapter });
    await prismaInstance.$connect();

    // Verify committed migration readiness directly from _prisma_migrations
    let applied: Array<{ migration_name: string; finished_at: Date | null }> = [];
    try {
      applied = await prismaInstance.$queryRaw<Array<{ migration_name: string; finished_at: Date | null }>>`
        SELECT migration_name, finished_at FROM "_prisma_migrations" WHERE finished_at IS NOT NULL;
      `;
    } catch {
      // If migrations table doesn't exist, deploy them now
      try {
        execSync("npx prisma migrate deploy", {
          env: {
            ...process.env,
            DATABASE_URL: TEST_DATABASE_URL,
            DIRECT_URL: TEST_DATABASE_URL
          },
          encoding: "utf8",
          stdio: "pipe"
        });
        applied = await prismaInstance.$queryRaw<Array<{ migration_name: string; finished_at: Date | null }>>`
          SELECT migration_name, finished_at FROM "_prisma_migrations" WHERE finished_at IS NOT NULL;
        `;
      } catch (err: any) {
        throw new Error(`Prisma migration deployment failed: ${err.stderr || err.message}`);
      }
    }

    if (!applied || applied.length === 0) {
      throw new Error("Test database schema verification failed: no finished migrations found.");
    }
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
