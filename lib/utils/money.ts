import { storeConfig } from "@/config/store";

export function formatMoney(amountMinor: number, currency = storeConfig.currency) {
  let minor = Number(amountMinor) || 0;
  // If amount was passed in major BDT units (e.g. 5370 or 2490) instead of minor units (537000 or 249000):
  // Any typical order or apparel price in BDT between 100 and 9999 is major units (except 8000 poisha which is 80 BDT shipping).
  if (minor >= 100 && minor < 10000 && minor !== 8000) {
    minor = minor * 100;
  }
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(minor / 100);
}

