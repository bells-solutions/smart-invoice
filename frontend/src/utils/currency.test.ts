import { describe, it, expect } from "vitest";
import {
  CURRENCY_SYMBOLS,
  getCurrencySymbol,
  formatCurrency,
  type CurrencyCode,
} from "./currency";

describe("Currency Utils", () => {
  describe("CURRENCY_SYMBOLS", () => {
    it("should contain all supported currencies", () => {
      expect(CURRENCY_SYMBOLS).toEqual({
        USD: "$",
        EUR: "€",
        XAF: "XAF",
      });
    });
  });

  describe("getCurrencySymbol", () => {
    it("should return correct symbol for USD", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("should return correct symbol for EUR", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("should return correct symbol for XAF", () => {
      expect(getCurrencySymbol("XAF")).toBe("XAF");
    });

    it("should return default symbol for unknown currency", () => {
      expect(getCurrencySymbol("UNKNOWN" as CurrencyCode)).toBe("$");
    });
  });

  describe("formatCurrency", () => {
    it("should format USD correctly", () => {
      expect(formatCurrency(123.45, "USD")).toBe("$ 123.45");
    });

    it("should format EUR correctly", () => {
      expect(formatCurrency(67.89, "EUR")).toBe("€ 67.89");
    });

    it("should format XAF correctly", () => {
      expect(formatCurrency(1000, "XAF")).toBe("XAF 1 000");
    });

    it("should format large numbers with spaces", () => {
      expect(formatCurrency(1000000, "USD")).toBe("$ 1 000 000");
    });

    it("should handle zero amounts", () => {
      expect(formatCurrency(0, "USD")).toBe("$ 0");
    });

    it("should handle negative amounts", () => {
      expect(formatCurrency(-50.25, "EUR")).toBe("€ -50.25");
    });

    it("should round to 2 decimal places", () => {
      expect(formatCurrency(123.456, "USD")).toBe("$ 123.46");
    });
  });
});
