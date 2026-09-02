export function PolicyContent({ title }: { title: string }) {
  return (
    <div className="container-shell max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Policy
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          This page is intentionally stored as configurable merchant content.
          Replace this placeholder with approved legal and operational copy
          before production deployment.
        </p>
        <p>
          The admin content model is prepared to store policy pages, FAQs,
          shipping rules, return windows, and customer support guidance.
        </p>
      </div>
    </div>
  );
}

