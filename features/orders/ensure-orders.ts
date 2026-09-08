import { prisma } from "@/db/prisma";

export async function ensureLegacyOrders() {
  try {
    const existing = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: "ELR-20260905-1842" },
          { guestEmail: "ismailhossain@email.com" }
        ]
      }
    });

    if (existing) {
      // If order was previously saved with 5370 (BDT 54) due to minor unit bug, fix it
      if (existing.grandTotal < 10000) {
        await prisma.order.update({
          where: { id: existing.id },
          data: {
            subtotal: 537000,
            grandTotal: 537000
          }
        }).catch(() => undefined);

        await prisma.orderItem.updateMany({
          where: { orderId: existing.id },
          data: {
            unitPrice: 537000,
            lineTotal: 537000
          }
        }).catch(() => undefined);
      }
      return;
    }

    let variant: { id: string; sku: string; color: string; size: string; product: { id: string; name: string } } | null =
      await prisma.productVariant.findFirst({
        include: { product: true }
      });

    let product: { id: string; name: string } | null = variant?.product ?? null;
    if (!product) {
      product = await prisma.product.findFirst();
    }

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
      }).catch(() => undefined);
    }

    await prisma.notification.create({
      data: {
        channel: "IN_APP",
        title: "New Order Placed (#ELR-20260905-1842)",
        body: "Md. Ismail Hossain placed an order for ৳5,370 via Cash on Delivery. Ready for fulfillment.",
        metadata: {
          orderId: newOrder.id,
          orderNumber: "ELR-20260905-1842",
          total: 537000,
          customer: "Md. Ismail Hossain",
          type: "ORDER",
          link: "/admin/orders"
        }
      }
    }).catch(() => undefined);
  } catch (err) {
    console.error("Order backfill note:", err);
  }
}
