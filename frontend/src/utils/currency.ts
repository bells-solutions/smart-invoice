export const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  XAF: "XAF",
} as const;

export type CurrencyCode = keyof typeof CURRENCY_SYMBOLS;

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency] || "$";
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return `${getCurrencySymbol(currency)} ${amount.toFixed(2)}`;
}
