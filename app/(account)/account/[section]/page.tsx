export const dynamic = "force-dynamic";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { WishlistPreview } from "@/components/account/wishlist-preview";
import { MapPin, User, Shield, Bell } from "lucide-react";

const SECTIONS: Record<string, string> = {
  profile: "Profile",
  addresses: "Addresses",
  wishlist: "Wishlist",
  notifications: "Notifications",
  security: "Security",
  support: "Support"
};

type Props = { params: Promise<{ section: string }> };

export default async function AccountSectionPage({ params }: Props) {
  const { section } = await params;
  const title = SECTIONS[section];

  if (!title) notFound();

  const session = await getServerSession();
  if (!session?.userId) {
    redirect(`/login?next=/account/${section}`);
  }

  // ─── Profile ────────────────────────────────────────────
  if (section === "profile") {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true, emailVerified: true, createdAt: true }
    });

    return (
      <div className="container-shell max-w-2xl py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h1 className="mt-2 text-3xl font-semibold flex items-center gap-2"><User size={22} /> Profile</h1>

        <div className="mt-8 rounded-lg border border-border bg-background divide-y divide-border">
          {[
            { label: "Name", value: user?.name ?? "—" },
            { label: "Email", value: `${user?.email ?? "—"}${user?.emailVerified ? " ✓" : " (unverified)"}` },
            { label: "Phone", value: user?.phone ?? "—" },
            { label: "Member since", value: user?.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" }) ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          To update your name, email, or phone — contact support or use the password reset flow.
        </p>
      </div>
    );
  }

  // ─── Addresses ──────────────────────────────────────────
  if (section === "addresses") {
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId, deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });

    return (
      <div className="container-shell max-w-2xl py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h1 className="mt-2 text-3xl font-semibold flex items-center gap-2"><MapPin size={22} /> Addresses</h1>

        {addresses.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-background p-8 text-center">
            <p className="text-sm text-muted-foreground">No saved addresses. Your delivery address will be saved after your first order.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-lg border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{addr.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{addr.line1}</p>
                    {addr.line2 && <p className="text-sm text-muted-foreground">{addr.line2}</p>}
                    <p className="text-sm text-muted-foreground">{addr.city}{addr.area ? `, ${addr.area}` : ""}</p>
                    {addr.postalCode && <p className="text-sm text-muted-foreground">{addr.postalCode}</p>}
                    <p className="text-sm text-muted-foreground">{addr.phone}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="shrink-0 rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium">Default</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Security ───────────────────────────────────────────
  if (section === "security") {
    const sessions = await prisma.session.findMany({
      where: { userId: session.userId, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return (
      <div className="container-shell max-w-2xl py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h1 className="mt-2 text-3xl font-semibold flex items-center gap-2"><Shield size={22} /> Security</h1>

        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold">Password</p>
            <p className="mt-1 text-sm text-muted-foreground">Use the forgot password flow to reset your password.</p>
            <a
              href="/forgot-password"
              className="mt-4 inline-flex h-9 items-center rounded-md border border-border px-4 text-sm hover:bg-muted"
            >
              Reset password
            </a>
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold">Active sessions</p>
            <div className="mt-4 space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground truncate max-w-xs">{s.userAgent ?? "Unknown device"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.ipAddress ?? "—"} · since {s.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-green-600 font-medium">Active</span>
                </div>
              ))}
              {sessions.length === 0 && <p className="text-sm text-muted-foreground">No active sessions found.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Notifications ──────────────────────────────────────
  if (section === "notifications") {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return (
      <div className="container-shell max-w-2xl py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h1 className="mt-2 text-3xl font-semibold flex items-center gap-2"><Bell size={22} /> Notifications</h1>

        {notifications.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-background p-8 text-center">
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-lg border border-border bg-background p-4 ${!n.readAt ? "border-l-2 border-l-foreground" : ""}`}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {n.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Wishlist ────────────────────────────────────────────
  if (section === "wishlist") {
    return (
      <div className="container-shell max-w-5xl py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
        <WishlistPreview />
      </div>
    );
  }

  // ─── Support ────────────────────────────────────────────
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <div className="container-shell max-w-2xl py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>

      {tickets.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">No support tickets yet.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-background p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-sm">{t.subject}</p>
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs capitalize">
                  {t.status.toLowerCase()}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
