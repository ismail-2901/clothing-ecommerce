import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { position: "asc" }, take: 1 }
              }
            },
            variant: true
          }
        },
        payments: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const deliveryAddress = order.deliveryAddress as Record<string, string> | null;
    const customerSnapshot = order.customerSnapshot as Record<string, string> | null;

    const mappedItems = order.items.map((item) => {
      const snapshot = item.productSnapshot as Record<string, any> | null;
      return {
        id: item.id,
        name: snapshot?.name || item.name,
        sku: snapshot?.sku || item.sku,
        color: snapshot?.color || item.color,
        size: snapshot?.size || item.size,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        image: snapshot?.image || item.product?.images?.[0]?.url || "/elaris-women.jpg"
      };
    });

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentProvider: order.payments[0]?.provider || "COD",
        createdAt: order.createdAt,
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        shippingTotal: order.shippingTotal,
        grandTotal: order.grandTotal,
        currency: order.currency,
        customerName: customerSnapshot?.name || deliveryAddress?.name || "Customer",
        customerEmail: customerSnapshot?.email || order.guestEmail || "",
        customerPhone: customerSnapshot?.phone || order.guestPhone || "",
        deliveryAddress: {
          name: deliveryAddress?.name || "",
          line1: deliveryAddress?.line1 || "",
          line2: deliveryAddress?.line2 || "",
          city: deliveryAddress?.city || "",
          area: deliveryAddress?.area || "",
          postalCode: deliveryAddress?.postalCode || "",
          country: deliveryAddress?.country || "Bangladesh"
        },
        items: mappedItems
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
