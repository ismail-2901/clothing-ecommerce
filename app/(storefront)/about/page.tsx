export default function AboutPage() {
  return <PolicyPage title="About" eyebrow="Brand" />;
}

function PolicyPage({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <div className="container-shell max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">
        This content is a configurable placeholder. Replace it with approved
        merchant copy before production launch.
      </p>
    </div>
  );
}

