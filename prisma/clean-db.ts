/**
 * clean-db.ts
 * Permanently deletes ALL transactional & content data from the database.
 * Preserves: Roles, Permissions, RolePermissions, StoreSetting, admin/superadmin Users.
 * Run: npx tsx prisma/clean-db.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, RoleName } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running clean-db");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Starting full database clean...\n");

  // 1. Deep dependents first
  await prisma.riskSignal.deleteMany({});
  console.log("✓ RiskSignal");

  await prisma.riskAssessment.deleteMany({});
  console.log("✓ RiskAssessment");

  await prisma.aIRecommendation.deleteMany({});
  console.log("✓ AIRecommendation");

  await prisma.conversationMessage.deleteMany({});
  console.log("✓ ConversationMessage");

  await prisma.conversation.deleteMany({});
  console.log("✓ Conversation");

  await prisma.auditLog.deleteMany({});
  console.log("✓ AuditLog");

  await prisma.notification.deleteMany({});
  console.log("✓ Notification");

  await prisma.supportTicket.deleteMany({});
  console.log("✓ SupportTicket");

  await prisma.fAQ.deleteMany({});
  console.log("✓ FAQ");

  await prisma.homepageSection.deleteMany({});
  console.log("✓ HomepageSection");

  await prisma.customerEvent.deleteMany({});
  console.log("✓ CustomerEvent");

  await prisma.abandonedCheckout.deleteMany({});
  console.log("✓ AbandonedCheckout");

  await prisma.review.deleteMany({});
  console.log("✓ Review");

  // 2. Orders & payments
  await prisma.refund.deleteMany({});
  console.log("✓ Refund");

  await prisma.shipment.deleteMany({});
  console.log("✓ Shipment");

  await prisma.payment.deleteMany({});
  console.log("✓ Payment");

  await prisma.orderStatusHistory.deleteMany({});
  console.log("✓ OrderStatusHistory");

  await prisma.orderItem.deleteMany({});
  console.log("✓ OrderItem");

  await prisma.order.deleteMany({});
  console.log("✓ Order");

  // 3. Cart & wishlist
  await prisma.cartItem.deleteMany({});
  console.log("✓ CartItem");

  await prisma.cart.deleteMany({});
  console.log("✓ Cart");

  await prisma.wishlistItem.deleteMany({});
  console.log("✓ WishlistItem");

  await prisma.wishlist.deleteMany({});
  console.log("✓ Wishlist");

  // 4. Discounts & coupons
  await prisma.discount.deleteMany({});
  console.log("✓ Discount");

  await prisma.coupon.deleteMany({});
  console.log("✓ Coupon");

  // 5. Products
  await prisma.inventoryMovement.deleteMany({});
  console.log("✓ InventoryMovement");

  await prisma.productImage.deleteMany({});
  console.log("✓ ProductImage");

  await prisma.productTag.deleteMany({});
  console.log("✓ ProductTag");

  await prisma.productVariant.deleteMany({});
  console.log("✓ ProductVariant");

  await prisma.product.deleteMany({});
  console.log("✓ Product");

  // 6. Collections & categories (keep structure, wipe data)
  await prisma.collection.deleteMany({});
  console.log("✓ Collection");

  // Delete child categories first, then parents
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany({});
  console.log("✓ Category (children then parents)");

  // 7. User data — keep admin/superadmin users, delete normal customers
  const adminRoles = await prisma.role.findMany({
    where: { name: { in: [RoleName.SUPER_ADMIN, RoleName.ADMIN] } },
    select: { id: true },
  });
  const adminRoleIds = adminRoles.map((r) => r.id);

  const adminUserRoles = await prisma.userRole.findMany({
    where: { roleId: { in: adminRoleIds } },
    select: { userId: true },
  });
  const adminUserIds = adminUserRoles.map((ur) => ur.userId);

  // Delete addresses of non-admin users
  await prisma.address.deleteMany({
    where: { userId: { notIn: adminUserIds } },
  });
  console.log("✓ Address (non-admin)");

  // Delete sessions & accounts of non-admin users
  await prisma.session.deleteMany({
    where: { userId: { notIn: adminUserIds } },
  });
  await prisma.account.deleteMany({
    where: { userId: { notIn: adminUserIds } },
  });
  console.log("✓ Session & Account (non-admin)");

  // Delete non-admin users
  await prisma.user.deleteMany({
    where: { id: { notIn: adminUserIds } },
  });
  console.log("✓ User (non-admin customers deleted, admin preserved)");

  // 8. Re-seed standard categories & Men/Women subcategories
  console.log("\n📦 Re-seeding base categories...");
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

  const menSubs = [
    { name: "Panjabi", slug: "men-panjabi", position: 1 },
    { name: "Waistcoat", slug: "men-waistcoat", position: 2 },
    { name: "Pajama", slug: "men-pajama", position: 3 },
    { name: "Shirt", slug: "men-shirt", position: 4 },
    { name: "Polo Shirt", slug: "men-polo-shirt", position: 5 },
    { name: "T-Shirt", slug: "men-t-shirt", position: 6 },
    { name: "Pants", slug: "men-pants", position: 7 },
    { name: "Plus Size", slug: "men-plus-size", position: 8 },
    { name: "Winter Wear", slug: "men-winter-wear", position: 9 },
    { name: "Blazer & Suit", slug: "men-blazer-suit", position: 10 },
    { name: "Men's Accessories", slug: "men-accessories", position: 11 },
  ];
  for (const sub of menSubs) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { position: sub.position },
      create: { name: sub.name, slug: sub.slug, position: sub.position, parentId: men.id },
    });
  }
  console.log("✓ Men subcategories");

  const womenSubs = [
    { name: "Saree", slug: "women-saree", position: 1 },
    { name: "Single Ethnic", slug: "women-single-ethnic", position: 2 },
    { name: "Women Shirt", slug: "women-shirt", position: 3 },
    { name: "Tees & Tank", slug: "women-tees-tank", position: 4 },
    { name: "Women Jacket", slug: "women-jacket", position: 5 },
    { name: "Hoodie", slug: "women-hoodie", position: 6 },
    { name: "Blazer", slug: "women-blazer", position: 7 },
    { name: "Winter Collection", slug: "women-winter-collection", position: 8 },
    { name: "Tops", slug: "women-tops", position: 9 },
    { name: "Baggy Jeans", slug: "women-baggy-jeans", position: 10 },
    { name: "Cord Set", slug: "women-cord-set", position: 11 },
  ];
  for (const sub of womenSubs) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { position: sub.position },
      create: { name: sub.name, slug: sub.slug, position: sub.position, parentId: women.id },
    });
  }
  console.log("✓ Women subcategories");

  console.log("\n✅ Database fully cleaned. Categories re-seeded. Admin users preserved.");
}

main()
  .catch((e) => {
    console.error("❌ Error during clean:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
