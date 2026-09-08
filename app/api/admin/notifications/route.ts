import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/db/prisma";
import { isValidAdminSession } from "@/lib/auth/admin-auth";

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  return isValidAdminSession(token);
}

export async function GET() {
  const isAuthed = await verifyAdmin();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbNotifications = await prisma.notification.findMany({
      where: { channel: "IN_APP" },
      orderBy: { createdAt: "desc" },
      take: 40
    });

    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true } },
        payments: { select: { provider: true }, take: 1, orderBy: { createdAt: "desc" } }
      }
    });

    const existingOrderNumbers = new Set(
      dbNotifications
        .map((n) => {
          const meta = n.metadata as Record<string, unknown> | null;
          return meta?.orderNumber;
        })
        .filter(Boolean)
    );

    const synthesizedFromOrders = recentOrders
      .filter((o) => !existingOrderNumbers.has(o.orderNumber))
      .map((o) => {
        const customerSnap = o.customerSnapshot as Record<string, string> | null;
        const deliveryAddr = o.deliveryAddress as Record<string, string> | null;
        const customer = o.user?.name || customerSnap?.name || deliveryAddr?.name || "Customer";
        const paymentProvider = o.payments[0]?.provider || "COD";
        const amountStr = `৳${(o.grandTotal / 100).toLocaleString("en-BD")}`;

        return {
          id: `ord-${o.id}`,
          type: "ORDER" as const,
          title: `New Order Placed (#${o.orderNumber})`,
          description: `${customer} placed an order for ${amountStr} via ${paymentProvider}. Ready for fulfillment.`,
          time: formatRelativeTime(o.createdAt),
          read: o.status !== "PENDING",
          link: `/admin/orders`,
          createdAt: o.createdAt.toISOString()
        };
      });

    const formattedDbNotifs = dbNotifications.map((n) => {
      const meta = (n.metadata as Record<string, unknown> | null) || {};
      return {
        id: n.id,
        type: (meta.type || "ORDER") as "ORDER" | "STOCK" | "SECURITY" | "REVIEW",
        title: n.title,
        description: n.body,
        time: formatRelativeTime(n.createdAt),
        read: !!n.readAt,
        link: (meta.link as string) || "/admin/orders",
        createdAt: n.createdAt.toISOString()
      };
    });

    const allNotifications = [...formattedDbNotifs, ...synthesizedFromOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = allNotifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: allNotifications,
      unreadCount
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAuthed = await verifyAdmin();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { id?: string; markAll?: boolean };
    const { id, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { readAt: null },
        data: { readAt: new Date() }
      });
      return NextResponse.json({ success: true });
    }

    if (id && !id.startsWith("ord-")) {
      await prisma.notification.updateMany({
        where: { id },
        data: { readAt: new Date() }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAuthed = await verifyAdmin();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id && !id.startsWith("ord-")) {
      await prisma.notification.delete({ where: { id } }).catch(() => undefined);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
