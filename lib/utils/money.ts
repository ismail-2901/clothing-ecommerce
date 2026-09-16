import { storeConfig } from "@/config/store";

export function formatMoney(amountMinor: number, currency = storeConfig.currency) {
  const minor = Number(amountMinor) || 0;
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(minor / 100);
}

