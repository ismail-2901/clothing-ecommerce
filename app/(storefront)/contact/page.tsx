"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="container-shell grid gap-8 py-12 md:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Contact
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Customer support</h1>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">
          We&rsquo;re here to help. Send us a message and we&rsquo;ll respond within 24 hours.
        </p>
        <dl className="mt-8 space-y-4 text-sm text-muted-foreground">
          <div>
            <dt className="font-semibold text-foreground">Email</dt>
            <dd>support@elarisstore.com</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">Hours</dt>
            <dd>Sunday – Thursday, 9 AM – 6 PM (BST)</dd>
          </div>
        </dl>
      </div>

      {status === "success" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border p-12 text-center">
          <CheckCircle2 size={36} className="text-emerald-600" />
          <h2 className="text-xl font-semibold">Message sent!</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Thank you for reaching out. We&rsquo;ll get back to you within 24 hours.
          </p>
          <button
            type="button"
            onClick={() => { setStatus("idle"); setForm({ name: "", email: "", message: "" }); }}
            className="mt-2 text-xs font-semibold underline underline-offset-4 hover:text-foreground"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form
          className="grid gap-4 rounded-lg border border-border p-6"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-1.5">
            <label htmlFor="contact-name" className="text-xs font-semibold text-foreground">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-name"
              required
              className="h-11 rounded-md border border-border px-3 text-sm focus:border-foreground focus:outline-none"
              placeholder="Aisha Rahman"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="contact-email" className="text-xs font-semibold text-foreground">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              className="h-11 rounded-md border border-border px-3 text-sm focus:border-foreground focus:outline-none"
              placeholder="your.name@email.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="contact-message" className="text-xs font-semibold text-foreground">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              minLength={10}
              className="min-h-32 rounded-md border border-border p-3 text-sm focus:border-foreground focus:outline-none resize-y"
              placeholder="Describe your question or issue…"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          {error && (
            <p className="text-xs font-medium text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-11 rounded-md bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {status === "loading" ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
