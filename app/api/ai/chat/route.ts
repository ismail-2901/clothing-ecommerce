import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { detectShoppingIntent } from "@/lib/ai/intent";
import { matchProducts } from "@/lib/ai/recommendation";
import { getAllProducts } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";
import { storePolicies } from "@/config/store";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { getClientIp } from "@/lib/auth/otp";

const bodySchema = z.object({
  message: z.string().min(1).max(500)
});

// Store knowledge base for RAG-style answers
const storeKnowledge: Record<string, string> = {
  shipping: `We deliver across Bangladesh (${storePolicies.shipping.dhakaDays} within Dhaka, ${storePolicies.shipping.outsideDhakaDays} outside Dhaka). Free delivery on orders over ৳${storePolicies.shipping.freeThreshold.toLocaleString()} (or with code ${storePolicies.shipping.freeShippingCode}).`,
  return: `You may return any unworn, unwashed item within ${storePolicies.returns.days} days of delivery. Start your return from the Account → Orders section.`,
  refund: `Refunds are processed within ${storePolicies.returns.refundDays} after we receive and inspect the returned item.`,
  size: "Our size guide is available on each product page. We carry XS, S, M, L, and XL. When in doubt, size up for relaxed fits.",
  payment: "We accept Cash on Delivery (COD), bKash, Nagad, SSLCommerz, and card payments.",
  contact: "Email us at support@elarisstore.com or use the Contact page. We respond within 24 hours."
};

function findKnowledge(message: string): string | null {
  const normalized = message.toLowerCase();
  if (normalized.match(/ship|deliver|delivery|free ship/)) return storeKnowledge.shipping;
  if (normalized.match(/return|exchange|send back/)) return storeKnowledge.return;
  if (normalized.match(/refund|money back/)) return storeKnowledge.refund;
  if (normalized.match(/size|sizing|guide|fit|measure/)) return storeKnowledge.size;
  if (normalized.match(/pay|payment|bkash|nagad|cod|card/)) return storeKnowledge.payment;
  if (normalized.match(/contact|support|help|email|reach/)) return storeKnowledge.contact;
  return null;
}

type ProductMatches = Awaited<ReturnType<typeof matchProducts>>;

function buildProductCards(
  matches: ProductMatches
): Array<{ id: string; name: string; slug: string; price: string; image: string; available: boolean }> {
  return matches.map(({ product }) => {
    const cheapestVariant = product.variants.reduce((a, b) => (a.price < b.price ? a : b));
    const inStock = product.variants.some((v) => v.stock > 0);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: formatMoney(cheapestVariant.price),
      image: product.images[0]?.src ?? "",
      available: inStock
    };
  });
}

async function buildTextResponse(
  intent: string,
  message: string,
  matches: ProductMatches
): Promise<string> {
  switch (intent) {
    case "ORDER_STATUS":
      return "To check your order status, please sign in and go to Account → Orders, or provide your order number and I can guide you.";

    case "RETURN":
      return storeKnowledge.return;

    case "DELIVERY":
      return storeKnowledge.shipping;

    case "GENERAL_SUPPORT": {
      const knowledge = findKnowledge(message);
      return knowledge ?? "I'm happy to help. Could you tell me more about what you're looking for?";
    }

    case "PRODUCT_SEARCH":
    default: {
      // BUG-32 FIX: Eliminate redundant getAllProducts() DB scan on 0 matches
      if (matches.length === 0) {
        return "I couldn't find any products matching that description. Try browsing the full collection or searching with different keywords.";
      }
      if (matches.length === 1) {
        return `I found a product that matches what you're looking for:`;
      }
      return `Here are ${matches.length} products that match your description:`;
    }
  }
}

export async function POST(request: NextRequest) {
  // 20 AI requests per minute per IP
  const ip = getClientIp(request as any);
  const rl = await rateLimiter.consume(`ai-chat:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message is required and must be under 500 characters." }, { status: 422 });
  }

  const { message } = parsed.data;

  // First check if store knowledge can answer directly (avoid unnecessary product search)
  const directKnowledge = findKnowledge(message);
  const structured = detectShoppingIntent(message);

  // For non-product intents, return knowledge base answer
  if (structured.intent !== "PRODUCT_SEARCH" || directKnowledge) {
    const text = directKnowledge ?? await buildTextResponse(structured.intent, message, []);
    return NextResponse.json({
      intent: structured.intent,
      text,
      products: []
    });
  }

  // Product search: run matching engine
  const matches = await matchProducts(structured.filters ?? {}, 4);

  // If no matches, try broader search (no filters, query only)
  const finalMatches = matches.length > 0
    ? matches
    : await matchProducts({ query: message }, 3);

  const products = buildProductCards(finalMatches);
  const text = await buildTextResponse("PRODUCT_SEARCH", message, finalMatches);

  return NextResponse.json({
    intent: "PRODUCT_SEARCH",
    text,
    products,
    filters: structured.filters
  });
}
