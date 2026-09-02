"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, Send, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/components/cart/cart-provider";

type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  available: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  products?: ProductCard[];
};

const suggestions = [
  "Black outfit under 3000",
  "Best deal for a dress",
  "Formal trouser in charcoal",
  "Return policy"
];

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessage("");
    setHistory((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });
      const data = await res.json();
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text ?? "I couldn't process that. Please try again.",
          products: data.products ?? []
        }
      ]);
    } catch {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." }
      ]);
    }

    setLoading(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(message);
  }

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <section
          aria-label="Shopping assistant"
          className="mb-3 flex w-[calc(100vw-32px)] max-w-sm flex-col rounded-xl border border-border bg-background shadow-md"
          style={{ height: "min(600px, 80vh)" }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <MessageSquareText aria-hidden="true" size={18} />
              <h2 className="text-sm font-semibold">Shopping assistant</h2>
            </div>
            <button
              aria-label="Close assistant"
              className="rounded-md p-1 hover:bg-muted"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 && (
              <div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Ask for products by color, budget, fit, or occasion. I can also help with
                  size guides, returns, shipping, and order questions.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      className="rounded-sm border border-border px-2.5 py-1.5 text-xs hover:bg-muted transition"
                      onClick={() => send(s)}
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-sm text-background"
                      : "max-w-[95%] space-y-3"
                  }
                >
                  <p className={msg.role === "assistant" ? "text-sm leading-6" : ""}>{msg.text}</p>

                  {/* Product cards in chat */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="grid gap-2">
                      {msg.products.map((product) => (
                        <div
                          key={product.id}
                          className="rounded-lg border border-border bg-background overflow-hidden"
                        >
                          {product.image && (
                            <div className="relative aspect-[16/9] bg-muted">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="320px"
                              />
                            </div>
                          )}
                          <div className="p-3">
                            <p className="text-sm font-semibold">{product.name}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{product.price}</p>
                            {!product.available && (
                              <p className="mt-0.5 text-xs text-danger">Out of stock</p>
                            )}
                            <div className="mt-2.5 flex gap-2">
                              <Link
                                href={`/products/${product.slug}`}
                                className="flex-1 rounded-md border border-border py-1.5 text-center text-xs font-semibold hover:bg-muted transition"
                              >
                                View
                              </Link>
                              <button
                                type="button"
                                disabled={!product.available}
                                className="flex items-center justify-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-zinc-800 disabled:opacity-40 transition"
                                onClick={() => {
                                  addItem({
                                    sku: `${product.id}_default`,
                                    productId: product.id,
                                    name: product.name,
                                    image: product.image,
                                    color: "",
                                    size: "",
                                    price: 0,
                                    quantity: 1
                                  });
                                }}
                              >
                                <ShoppingBag size={12} /> Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner size="sm" /> Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className="flex shrink-0 gap-2 border-t border-border p-3"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="assistant-message">
              Message
            </label>
            <input
              ref={inputRef}
              id="assistant-message"
              className="min-w-0 flex-1 rounded-md border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              maxLength={500}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Find a black outfit under 3,000…"
              value={message}
            />
            <Button disabled={loading || !message.trim()} size="sm" type="submit">
              <Send aria-hidden="true" size={16} />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </section>
      )}

      <button
        aria-label={open ? "Close shopping assistant" : "Open shopping assistant"}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-md hover:bg-zinc-800 transition"
        onClick={open ? () => setOpen(false) : handleOpen}
        type="button"
      >
        {open ? <X aria-hidden="true" size={20} /> : <MessageSquareText aria-hidden="true" size={22} />}
      </button>
    </div>
  );
}
