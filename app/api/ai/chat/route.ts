import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { detectShoppingIntent } from "@/lib/ai/intent";
import { matchProducts } from "@/lib/ai/recommendation";
import { formatMoney } from "@/lib/utils/money";
import { storeConfig, storePolicies } from "@/config/store";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { getClientIp } from "@/lib/auth/otp";
import { prisma } from "@/db/prisma";

const bodySchema = z.object({
  message: z.string().min(1).max(500)
});

// Comprehensive store knowledge base
const storeKnowledge: Record<string, string> = {
  greeting: "Hello! I am ELARIS AI, your personal shopping assistant. I can help you discover outfits, track your existing orders in real time, check active promo codes, or answer questions about delivery, returns, and sizing. How can I assist you today?",
  shipping: `We deliver nationwide across Bangladesh:\n• Dhaka City: ৳${storePolicies.shipping.insideDhakaFee} delivery fee (${storePolicies.shipping.dhakaDays})\n• Outside Dhaka: ৳${storePolicies.shipping.outsideDhakaFee} delivery fee (${storePolicies.shipping.outsideDhakaDays})\n• Free Delivery: Automatically applied on orders of ৳${storePolicies.shipping.freeThreshold.toLocaleString()} or more, or with code ${storePolicies.shipping.freeShippingCode}.`,
  return: `You may return or exchange any unworn, unwashed item with tags attached within ${storePolicies.returns.days} days of delivery. You can initiate a return directly from Account → Orders.`,
  refund: `Refunds are processed within ${storePolicies.returns.refundDays} after our inspection team receives and verifies the returned item. Refunds are returned to your original payment method.`,
  size: "We provide size guides (XS, S, M, L, XL, XXL) on every product page. All measurements are in inches. If you are between sizes, we recommend sizing up for a relaxed fit.",
  payment: "We accept Cash on Delivery (COD), bKash, Nagad, SSLCommerz, and all major Debit/Credit cards (Visa, Mastercard, Amex).",
  contact: `You can reach the ELARIS team via:\n• Email: ${storeConfig.contact.email}\n• Phone: ${storeConfig.contact.phone}\n• Store Location: ${storeConfig.contact.address}\n• Operating Hours: 10:00 AM – 8:00 PM, 7 days a week.`,
  order_help: "To track your order, please provide your Order Number (e.g., #ATC-XXXXX). You can also track your order at /track or view your history under Account → Orders."
};

function findKnowledge(message: string): string | null {
  const normalized = message.toLowerCase();
  if (normalized.match(/^(hi|hello|hey|greetings|who are you|what can you do)\b/)) return storeKnowledge.greeting;
  if (normalized.match(/ship|deliver|delivery|courier|free ship/)) return storeKnowledge.shipping;
  if (normalized.match(/return|exchange|send back/)) return storeKnowledge.return;
  if (normalized.match(/refund|money back/)) return storeKnowledge.refund;
  if (normalized.match(/size|sizing|guide|fit|measure/)) return storeKnowledge.size;
  if (normalized.match(/pay|payment|bkash|nagad|cod|card/)) return storeKnowledge.payment;
  if (normalized.match(/contact|support|help|email|reach|phone|address|location|store|hours/)) return storeKnowledge.contact;
  if (normalized.match(/track.*order|where.*order|my order|status/)) return storeKnowledge.order_help;
  return null;
}

async function findOrderDetails(message: string): Promise<string | null> {
  const match = message.match(/\b((?:ATC|ORD|ATELIER)[A-Z0-9_-]+)\b/i) || message.match(/#([a-zA-Z0-9-]{6,})/);
  if (!match) return null;
  const orderNum = (match[1] || match[0]).replace(/^#/, "").trim();

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: orderNum, mode: "insensitive" } },
          { id: orderNum }
        ]
      },
      include: {
        items: { select: { name: true, quantity: true, color: true, size: true } },
        shipments: { select: { carrier: true, trackingNumber: true, status: true, estimatedDelivery: true }, take: 1, orderBy: { createdAt: "desc" } }
      }
    });

    if (!order) {
      return `I searched for order #${orderNum}, but couldn't find a matching record. Please verify the order number (e.g., #ATC-XXXXX) or sign in to view your orders under Account → Orders.`;
    }

    const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name} (${i.color}/${i.size})`).join(", ");
    const shipment = order.shipments[0];
    const shipmentText = shipment
      ? ` Courier: ${shipment.carrier || "Courier Service"} (Tracking: ${shipment.trackingNumber || "Assigned"}). Status: ${shipment.status.replace(/_/g, " ")}.`
      : "";

    return `Order #${order.orderNumber} is currently ${order.status.replace(/_/g, " ")}. Total: ${formatMoney(order.grandTotal)} (${order.paymentStatus}). Items: ${itemsSummary}.${shipmentText} You can view full tracking details at /track/${order.orderNumber}.`;
  } catch {
    return null;
  }
}

async function findCouponDetails(): Promise<string> {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { status: "ACTIVE" },
      take: 4,
      orderBy: { createdAt: "desc" }
    });
    if (coupons.length > 0) {
      const list = coupons.map((c) => {
        const val = c.type === "PERCENTAGE" ? `${c.value}% OFF` : `৳${c.value / 100} OFF`;
        const min = c.minSubtotal ? ` (Min spend: ৳${c.minSubtotal / 100})` : "";
        return `• Code '${c.code}': ${val}${min}`;
      }).join("\n");
      return `Current active offers & coupons at ELARIS:\n${list}\n• Code '${storePolicies.shipping.freeShippingCode}': Free nationwide delivery on orders over ৳${storePolicies.shipping.freeThreshold.toLocaleString()}.\nApply code at checkout!`;
    }
  } catch {}
  return `Current offers:\n• Use code '${storePolicies.shipping.freeShippingCode}' for free delivery on orders over ৳${storePolicies.shipping.freeThreshold.toLocaleString()}.\n• Explore current deals and new arrivals on our collection pages!`;
}

async function callLLM(message: string, context: string): Promise<string | null> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) return null;

  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const model = process.env.AI_MODEL_CHAT || (provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini");

  const systemPrompt = `You are ELARIS AI, the knowledgeable and polite shopping assistant for ELARIS (a premium fashion clothing brand in Bangladesh).
Knowledge context:
${context}
Instructions:
- Provide helpful, friendly, concise answers about ELARIS products, sizing, delivery (৳${storePolicies.shipping.insideDhakaFee} inside Dhaka, ৳${storePolicies.shipping.outsideDhakaFee} outside, free over ৳${storePolicies.shipping.freeThreshold}), 14-day returns, payments, and order tracking.
- All currency is BDT (৳).
- Keep answers under 3-4 sentences when possible.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    if (provider === "gemini" || apiKey.startsWith("AIza")) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\nCustomer question: ${message}` }] }
          ]
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 300
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    }
  } catch {
    // Fallback to grounded knowledge
  }
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
  const normalized = message.toLowerCase();

  // 1. Check for real-time order tracking with order number
  const orderDetails = await findOrderDetails(message);
  if (orderDetails) {
    return NextResponse.json({
      intent: "ORDER_STATUS",
      text: orderDetails,
      products: []
    });
  }

  // 2. Check for discount / coupon queries
  if (normalized.match(/coupon|discount|promo|voucher|deal|save\d+/)) {
    const couponInfo = await findCouponDetails();
    return NextResponse.json({
      intent: "GENERAL_SUPPORT",
      text: couponInfo,
      products: []
    });
  }

  // 3. Check store knowledge base
  const directKnowledge = findKnowledge(message);
  const structured = detectShoppingIntent(message);

  if (directKnowledge) {
    return NextResponse.json({
      intent: structured.intent,
      text: directKnowledge,
      products: []
    });
  }

  // 4. Non-product questions (orders without number, support, general queries)
  if (structured.intent !== "PRODUCT_SEARCH") {
    const storeContext = Object.entries(storeKnowledge)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join("\n");
    const llmAnswer = await callLLM(message, storeContext);
    const fallbackText =
      structured.intent === "ORDER_STATUS"
        ? storeKnowledge.order_help
        : structured.intent === "RETURN"
          ? storeKnowledge.return
          : structured.intent === "DELIVERY"
            ? storeKnowledge.shipping
            : "I'm here to help! You can ask me to find outfits, track an order (e.g. ATC-XXXXX), check active coupons, or ask about our shipping and returns.";

    return NextResponse.json({
      intent: structured.intent,
      text: llmAnswer ?? fallbackText,
      products: []
    });
  }

  // 5. Product search & recommendations
  const matches = await matchProducts(structured.filters ?? {}, 4);
  const finalMatches = matches.length > 0
    ? matches
    : await matchProducts({ query: message }, 3);

  const products = buildProductCards(finalMatches);

  let text = "";
  if (finalMatches.length === 0) {
    const storeContext = Object.entries(storeKnowledge)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join("\n");
    const llmFallback = await callLLM(message, storeContext);
    text =
      llmFallback ??
      "I couldn't find any products matching that description. Try searching by color, budget, or clothing type (e.g., 'black shirt under 3000').";
  } else if (finalMatches.length === 1) {
    text = "I found a product that matches what you're looking for:";
  } else {
    text = `Here are ${finalMatches.length} products that match your description:`;
  }

  return NextResponse.json({
    intent: "PRODUCT_SEARCH",
    text,
    products,
    filters: structured.filters
  });
}
