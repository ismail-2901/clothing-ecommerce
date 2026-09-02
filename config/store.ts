function getStoreUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://elarisstore.com";
}

export const storeConfig = {
  name: "Elaris",
  description:
    "A premium single-brand clothing store with grounded AI shopping assistance.",
  url: getStoreUrl(),
  currency: process.env.STORE_CURRENCY || "BDT",
  locale: process.env.STORE_LOCALE || "en-BD",
  orderPrefix: process.env.ORDER_PREFIX || "ORD",
  contact: {
    email: "hello@example.com",
    phone: "+8801000000000"
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com"
  }
} as const;
