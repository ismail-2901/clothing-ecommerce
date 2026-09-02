export const storeConfig = {
  name: "Elaris",
  description:
    "A premium single-brand clothing store with grounded AI shopping assistance.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  currency: process.env.STORE_CURRENCY ?? "BDT",
  locale: process.env.STORE_LOCALE ?? "en-BD",
  orderPrefix: process.env.ORDER_PREFIX ?? "ORD",
  contact: {
    email: "hello@example.com",
    phone: "+8801000000000"
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com"
  }
} as const;

