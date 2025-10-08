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
  // Format the number with 2 decimal places
  const formattedAmount = amount.toFixed(2);

  // Remove .00 if it's a whole number
  const displayAmount = formattedAmount.endsWith(".00")
    ? formattedAmount.slice(0, -3)
    : formattedAmount;

  // Add spaces every 3 digits before the decimal point
  const [integerPart, decimalPart] = displayAmount.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Reconstruct the number
  const finalAmount = decimalPart
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;

  return `${getCurrencySymbol(currency)} ${finalAmount}`;
}
