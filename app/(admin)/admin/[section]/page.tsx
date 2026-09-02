import { notFound } from "next/navigation";

const sections: Record<string, string> = {
  orders: "Orders",
  inventory: "Inventory",
  offers: "Offers",
  customers: "Customers",
  risk: "Risk Center",
  analytics: "Analytics",
  settings: "Settings",
  categories: "Categories",
  "abandoned-checkouts": "Abandoned Checkouts",
  reviews: "Reviews",
  notifications: "Notifications",
  content: "Content",
  admins: "Admins",
  "audit-logs": "Audit Logs"
};

type AdminSectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  const { section } = await params;
  const title = sections[section];

  if (!title) {
    notFound();
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Admin
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      <div className="mt-8 rounded-lg border border-border bg-background p-6">
        <p className="text-sm leading-6 text-muted-foreground">
          This admin surface is registered in the route map. CRUD forms, filters,
          pagination, audit logging, and authorization checks are implemented
          feature-by-feature after the database migration is active.
        </p>
      </div>
    </div>
  );
}
