import Link from "next/link";
import { storeConfig } from "@/config/store";

const footerLinks = [
  ["Shipping", "/shipping"],
  ["Returns", "/returns"],
  ["FAQ", "/faq"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Contact", "/contact"]
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="container-shell grid gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-semibold">{storeConfig.name}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Premium clothing commerce foundation prepared for real catalog,
            payment, shipping, support, and AI provider configuration.
          </p>
        </div>
        <nav className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
          {footerLinks.map(([label, href]) => (
            <Link key={label} href={href} className="text-muted-foreground hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

