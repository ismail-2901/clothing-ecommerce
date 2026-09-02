export default function ContactPage() {
  return (
    <div className="container-shell grid gap-8 py-12 md:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Contact
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Customer support</h1>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">
          Connect email, SMS, and support ticket providers before production.
        </p>
      </div>
      <form className="grid gap-4 rounded-lg border border-border p-6">
        <input className="h-11 rounded-md border border-border px-3 text-sm" placeholder="Name" />
        <input className="h-11 rounded-md border border-border px-3 text-sm" placeholder="Email" />
        <textarea className="min-h-32 rounded-md border border-border p-3 text-sm" placeholder="Message" />
        <button className="h-11 rounded-md bg-foreground px-5 text-sm font-semibold text-background" type="submit">
          Send message
        </button>
      </form>
    </div>
  );
}

