import { prisma } from "@/db/prisma";
import { storeConfig, storePolicies } from "@/config/store";
import { formatMoney } from "@/lib/utils/money";

let cachedContext: { text: string; expiresAt: number } | null = null;

export async function getDynamicStoreContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && cachedContext.expiresAt > now) {
    return cachedContext.text;
  }

  try {
    const [categories, products, coupons] = await Promise.all([
      prisma.category.findMany({
        where: { deletedAt: null },
        select: { name: true, slug: true, description: true },
        orderBy: { position: "asc" },
        take: 50
      }),
      prisma.product.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        include: {
          category: { select: { name: true } },
          variants: {
            where: { deletedAt: null },
            select: { priceOverride: true, color: true, size: true, stockQuantity: true, isAvailable: true }
          }
        },
        take: 60,
        orderBy: { createdAt: "desc" }
      }),
      prisma.coupon.findMany({
        where: {
          status: "ACTIVE",
          deletedAt: null,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }
          ]
        },
        select: { code: true, type: true, value: true, minSubtotal: true },
        take: 10
      })
    ]);

    const categoryList =
      categories.length > 0
        ? categories.map((c) => `- ${c.name} (Slug: ${c.slug}${c.description ? ` - ${c.description}` : ""})`).join("\n")
        : "- Catalog collections (New arrivals dropping regularly)";

    const productList =
      products.length > 0
        ? products
            .map((p) => {
              const prices = p.variants
                .map((v) => v.priceOverride ?? p.salePrice ?? p.basePrice)
                .filter((pr) => pr > 0);
              const minPrice = prices.length > 0 ? Math.min(...prices) : (p.salePrice ?? p.basePrice);
              const colors = Array.from(new Set(p.variants.map((v) => v.color).filter(Boolean)));
              const sizes = Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean)));
              const inStock = p.variants.some((v) => v.stockQuantity > 0 && v.isAvailable);
              return `- ${p.name} | Category: ${p.category?.name || "General"} | Starting at: ${formatMoney(minPrice)} | Colors: ${colors.join(", ") || "Standard"} | Sizes: ${sizes.join(", ") || "Standard"} | Stock: ${inStock ? "Available" : "Restocking soon"} | Link: /products/${p.slug}`;
            })
            .join("\n")
        : "Catalog status: New season's collection is actively being added. Invite customers to explore categories or ask for upcoming items.";

    const couponList =
      coupons.length > 0
        ? coupons
            .map((c) => {
              const discountStr = c.type === "PERCENTAGE" ? `${c.value}% OFF` : `${formatMoney(c.value)} OFF`;
              const minSpend = c.minSubtotal ? ` (Min spend: ${formatMoney(c.minSubtotal)})` : "";
              return `- Code '${c.code}': ${discountStr}${minSpend}`;
            })
            .join("\n")
        : `- Code '${storePolicies.shipping.freeShippingCode}': Free nationwide delivery on orders over ${formatMoney(storePolicies.shipping.freeThreshold * 100)}`;

    const contextText = `
STORE OVERVIEW & BRAND IDENTITY:
- Brand Name: ELARIS
- Mission: Contemporary Premium Fashion & Apparel in Bangladesh. ELARIS combines modern minimalist cuts, quality craftsmanship, premium cotton/linen/knit fabrics, and timeless aesthetics.
- Flagship Address: ${storeConfig.contact.address}
- Store Hours: 10:00 AM – 8:00 PM (Every day, 7 days a week)
- Customer Support Email: ${storeConfig.contact.email}
- Customer Support Phone: ${storeConfig.contact.phone}
- Store Website: https://elaris-store.vercel.app

SHIPPING & DELIVERY RULES (BANGLADESH NATIONWIDE):
- Inside Dhaka City: ৳${storePolicies.shipping.insideDhakaFee} (${storePolicies.shipping.dhakaDays}, typically 1-2 business days)
- Outside Dhaka (all 64 districts): ৳${storePolicies.shipping.outsideDhakaFee} (${storePolicies.shipping.outsideDhakaDays}, typically 2-4 business days)
- Free Delivery: Automatically applied on orders of ৳${storePolicies.shipping.freeThreshold.toLocaleString()} or more, or by using coupon code '${storePolicies.shipping.freeShippingCode}'.
- Express / Urgent Delivery: Available inside Dhaka upon request via support.
- Order Tracking: Customers can track live progress at /track using their Order Number (e.g., #ATC-XXXXX). Logged-in customers can view live updates under Account → Orders.

PAYMENT METHODS:
- Cash on Delivery (COD) available nationwide across Bangladesh.
- Mobile Financial Services (MFS): bKash, Nagad, Rocket.
- Online Debit/Credit Cards & Internet Banking via SSLCommerz (Visa, Mastercard, Amex, etc.).

RETURN, EXCHANGE & REFUND POLICIES:
- Returns & Exchanges: Allowed within ${storePolicies.returns.days} days of delivery.
- Conditions: Garments must be unworn, unwashed, in original condition with all tags and packaging intact.
- Process: Easily initiated from Account → Orders or by contacting customer support.
- Refunds: Processed within ${storePolicies.returns.refundDays} business days following return quality inspection, credited back to original payment method or bKash/Nagad.

SIZE & FIT RECOMMENDATIONS:
- Available Sizes: XS, S, M, L, XL, XXL (all measurements provided in inches on individual product pages).
- Fitting Tip: Fits true-to-size. For oversized streetwear or relaxed layering looks, recommend sizing up one size.

AVAILABLE CATEGORIES (${categories.length}):
${categoryList}

CURRENT PRODUCTS IN STORE (${products.length}):
${productList}

ACTIVE DISCOUNTS & OFFERS:
${couponList}
`;

    cachedContext = {
      text: contextText.trim(),
      expiresAt: now + 60_000 // Cache for 60 seconds
    };

    return cachedContext.text;
  } catch (err) {
    console.error("[getDynamicStoreContext] Error loading context:", err);
    return `ELARIS Premium Fashion (Bangladesh). Inside Dhaka ৳60 (1-2 days), outside Dhaka ৳120 (2-4 days). Free delivery over ৳2,000. Cash on delivery, bKash, Nagad, Cards accepted. 14-day returns.`;
  }
}
