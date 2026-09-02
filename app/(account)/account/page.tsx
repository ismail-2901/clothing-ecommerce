import Link from "next/link";
import { Bell, Heart, MapPin, Package, Shield, UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

const accountSections = [
  ["Orders", "Track purchases and request eligible returns.", Package, "/account/orders"],
  ["Profile", "Update name, phone, and communication preferences.", UserRound, "/account/profile"],
  ["Addresses", "Manage delivery addresses.", MapPin, "/account/addresses"],
  ["Wishlist", "Review saved products and move items to cart.", Heart, "/account/wishlist"],
  ["Notifications", "Control order and offer updates.", Bell, "/account/notifications"],
  ["Security", "Manage password and session settings.", Shield, "/account/security"]
] as const;

export default function AccountPage() {
  return (
    <div className="container-shell py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Account
      </p>
      <h1 className="mt-2 text-4xl font-semibold">Customer center</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accountSections.map(([title, copy, Icon, href]) => (
          <Link key={title} href={href} className="rounded-lg border border-border p-5 transition hover:shadow-md">
            <Icon aria-hidden="true" size={24} />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

