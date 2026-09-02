import type { AssistantStructuredOutput, ProductFilters } from "@/lib/ai/schemas";

const knownColors = ["black", "white", "charcoal", "blue", "green", "red", "cream"];
const knownSizes = ["xs", "s", "m", "l", "xl", "xxl"];
const categoryTerms: Record<string, string> = {
  shirt: "shirt",
  shirts: "shirt",
  dress: "dress",
  dresses: "dress",
  trouser: "trouser",
  trousers: "trouser",
  tee: "tee",
  tshirt: "tee",
  "t-shirt": "tee"
};

export function detectShoppingIntent(message: string): AssistantStructuredOutput {
  const normalized = message.toLowerCase();
  const filters: ProductFilters = {
    query: message
  };

  const color = knownColors.find((item) => normalized.includes(item));
  if (color) {
    filters.color = color;
  }

  const size = knownSizes.find((item) => new RegExp(`\\b${item}\\b`, "i").test(message));
  if (size) {
    filters.size = size.toUpperCase();
  }

  const category = Object.entries(categoryTerms).find(([term]) => normalized.includes(term))?.[1];
  if (category) {
    filters.category = category;
  }

  const budget = parseBudget(normalized);
  if (budget) {
    filters.maxPrice = budget * 100;
  }

  if (normalized.includes("where is my order") || normalized.includes("order status")) {
    return {
      intent: "ORDER_STATUS",
      filters,
      response: "I can help with order status after verifying the signed-in customer session."
    };
  }

  if (normalized.includes("return")) {
    return {
      intent: "RETURN",
      filters,
      response: "Return answers should be grounded in the store policy knowledge base."
    };
  }

  if (normalized.includes("delivery") || normalized.includes("shipping")) {
    return {
      intent: "DELIVERY",
      filters,
      response: "Delivery answers should be grounded in configured shipping rules."
    };
  }

  return {
    intent: "PRODUCT_SEARCH",
    filters,
    response: "I found catalog products that match the structured filters I could safely infer."
  };
}

function parseBudget(message: string) {
  const match = message.match(/(?:under|below|less than|max|maximum)\s*(?:bdt|tk|taka|৳)?\s*(\d{3,7})/i);
  return match ? Number(match[1]) : undefined;
}

