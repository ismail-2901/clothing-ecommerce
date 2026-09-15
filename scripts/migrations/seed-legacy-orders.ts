import { prisma } from "@/db/prisma";

/**
 * One-time migration/seed script: Ensures baseline legacy demo order exists.
 * Usage:
 *   npx tsx scripts/migrations/seed-legacy-orders.ts [--confirm]
 */

const isConfirmed = process.argv.includes("--confirm");

async function seedLegacyOrder() {
  if (!isConfirmed) {
    console.error("ERROR: Modifying database requires the --confirm flag.");
    console.error("Usage: npx tsx scripts/migrations/seed-legacy-orders.ts --confirm");
    process.exit(1);
  }

  const existing = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: "ELR-20260905-1842" },
        { guestEmail: "ismailhossain@email.com" }
      ]
    }
  });

  if (existing) {
    console.log("Legacy order already exists (id:", existing.id, "). Skipping creation.");
    return;
  }

  let variant = await prisma.productVariant.findFirst({
    include: { product: true }
  });

  let product = variant?.product ?? (await prisma.product.findFirst());

  if (!variant && product) {
    variant = await prisma.productVariant.findFirst({
      where: { productId: product.id },
      include: { product: true }
    });
  }

  const newOrder = await prisma.order.create({
    data: {
      orderNumber: "ELR-20260905-1842",
      status: "PENDING",
      paymentStatus: "PENDING",
      guestEmail: "ismailhossain@email.com",
      guestPhone: "+8801712345678",
      subtotal: 537000,
      discountTotal: 0,
      shippingTotal: 0,
      grandTotal: 537000,
      currency: "BDT",
      deliveryAddress: {
        name: "Md. Ismail Hossain",
        line1: "House 12, Road 5, Block C",
        city: "Dhaka",
        area: "Mirpur",
        postalCode: "1216",
        country: "Bangladesh"
      },
      customerSnapshot: {
        name: "Md. Ismail Hossain",
        email: "ismailhossain@email.com",
        phone: "+8801712345678"
      },
      history: {
        create: {
          previousStatus: null,
          newStatus: "PENDING",
          note: "Order placed via online checkout"
        }
      },
      payments: {
        create: {
          provider: "COD",
          amount: 537000,
          currency: "BDT",
          status: "PENDING"
        }
      }
    }
  });

  if (variant && product) {
    await prisma.orderItem.create({
      data: {
        orderId: newOrder.id,
        productId: product.id,
        variantId: variant.id,
        sku: variant.sku,
        name: product.name,
        color: variant.color || "Black",
        size: variant.size || "M",
        unitPrice: 537000,
        quantity: 1,
        lineTotal: 537000,
        productSnapshot: {
          name: product.name,
          sku: variant.sku,
          color: variant.color || "Black",
          size: variant.size || "M",
          price: 537000,
          image: "/elaris-hero.jpg"
        }
      }
    });
  }

  console.log("Successfully seeded legacy order:", newOrder.orderNumber);
}

seedLegacyOrder()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("Error seeding legacy order:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
