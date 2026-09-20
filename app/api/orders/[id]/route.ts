import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const GUEST_ORDER_TOKEN_COOKIE = "guest_order_token";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  // ------------------------------------------------------------------
  // Identity: resolve caller as authenticated user or admin
  // ------------------------------------------------------------------
  const session = await auth.api.getSession({ headers: await headers() });
  const callerId = session?.user?.id ?? null;

  // ------------------------------------------------------------------
  // Fetch the order (by UUID id or orderNumber)
  // ------------------------------------------------------------------
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }]
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
      // BUG-48 FIX: Don't take: 1 which can mask successful payments on retry; fetch all payments
      payments: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // ------------------------------------------------------------------
  // Authorization: check ownership first; defer admin DB check (BUG-43 FIX)
  // ------------------------------------------------------------------
  const isOwner = Boolean(callerId && order.userId === callerId);

  let isAdmin = false;
  // BUG-43 FIX: Only perform admin role DB lookup if caller is not the owner
  if (callerId && !isOwner) {
    const adminRole = await prisma.userRole.findFirst({
      where: {
        userId: callerId,
        role: { name: { in: ["ADMIN", "SUPER_ADMIN"] } }
      },
      select: { roleId: true }
    });
    isAdmin = !!adminRole;
  }

  // ------------------------------------------------------------------
  // Authorization: admin bypasses; authenticated owner check; guest token check
  // ------------------------------------------------------------------
  const cookieStore = await cookies();
  const guestToken =
    cookieStore.get(GUEST_ORDER_TOKEN_COOKIE)?.value ||
    request.nextUrl.searchParams.get("token");

  const isGuestAuthorized = Boolean(!order.userId && order.guestToken && guestToken === order.guestToken);

  if (!isAdmin && !isOwner && !isGuestAuthorized) {
    // Limited public tracking view without PII
    if (request.nextUrl.searchParams.get("view") === "tracking") {
      const deliveryAddress = order.deliveryAddress as Record<string, string> | null;
      return NextResponse.json({
        tracking: {
          orderNumber: order.orderNumber,
          status: order.status,
          createdAt: order.createdAt,
          destinationCity: deliveryAddress?.city || ""
        }
      });
    }

    // Return 404 — do not confirm order existence to unauthenticated random callers
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // ------------------------------------------------------------------
  // Build response — strip sensitive fields from guest/customer view
  // ------------------------------------------------------------------
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

    const primaryPayment = order.payments.find((p) => p.status === "PAID") ?? order.payments[0];

    const responsePayload: Record<string, unknown> = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentProvider: primaryPayment?.provider || "COD",
      payments: order.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        amount: p.amount,
        createdAt: p.createdAt
      })),
      createdAt: order.createdAt,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    grandTotal: order.grandTotal,
    currency: order.currency,
    customerName: customerSnapshot?.name || deliveryAddress?.name || "Customer",
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
  };

  // Only expose full PII to the order owner (authenticated) or admin.
  // Guests receive the order via token-gated access but we still expose their
  // own contact info for the confirmation page.
  if (isOwner || isAdmin || isGuestAuthorized) {
    responsePayload.customerEmail = customerSnapshot?.email || order.guestEmail || "";
    responsePayload.customerPhone = customerSnapshot?.phone || order.guestPhone || "";
  }

  return NextResponse.json({ order: responsePayload });
}
