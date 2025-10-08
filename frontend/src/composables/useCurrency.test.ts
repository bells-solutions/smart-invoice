import { describe, it, expect, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCurrency } from "./useCurrency";

// Mock the auth store
vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from "@/stores/auth";

describe("useCurrency Composable", () => {
  let mockAuthStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());

    mockAuthStore = {
      user: null,
    };

    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  describe("userCurrency", () => {
    it("should return XAF as default when user has no currency", () => {
      mockAuthStore.user = { id: "1", email: "test@example.com" };

      const { userCurrency } = useCurrency();

      expect(userCurrency.value).toBe("XAF");
    });

    it("should return user currency when set to USD", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "USD",
      };

      const { userCurrency } = useCurrency();

      expect(userCurrency.value).toBe("USD");
    });

    it("should return user currency when set to EUR", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "EUR",
      };

      const { userCurrency } = useCurrency();

      expect(userCurrency.value).toBe("EUR");
    });

    it("should return user currency when set to XAF", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "XAF",
      };

      const { userCurrency } = useCurrency();

      expect(userCurrency.value).toBe("XAF");
    });
  });

  describe("currencySymbol", () => {
    it("should return $ for USD", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "USD",
      };

      const { currencySymbol } = useCurrency();

      expect(currencySymbol.value).toBe("$");
    });

    it("should return € for EUR", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "EUR",
      };

      const { currencySymbol } = useCurrency();

      expect(currencySymbol.value).toBe("€");
    });

    it("should return XAF for XAF", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "XAF",
      };

      const { currencySymbol } = useCurrency();

      expect(currencySymbol.value).toBe("XAF");
    });

    it("should return $ as default when no currency set", () => {
      mockAuthStore.user = { id: "1", email: "test@example.com" };

      const { currencySymbol } = useCurrency();

      expect(currencySymbol.value).toBe("XAF");
    });
  });

  describe("formatAmount", () => {
    it("should format amount with USD", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "USD",
      };

      const { formatAmount } = useCurrency();

      expect(formatAmount(123.45)).toBe("$ 123.45");
    });

    it("should format amount with EUR", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "EUR",
      };

      const { formatAmount } = useCurrency();

      expect(formatAmount(67.89)).toBe("€ 67.89");
    });

    it("should format amount with XAF", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "XAF",
      };

      const { formatAmount } = useCurrency();

      expect(formatAmount(1000)).toBe("XAF 1 000");
    });

    it("should format amount with default USD when no currency set", () => {
      mockAuthStore.user = { id: "1", email: "test@example.com" };

      const { formatAmount } = useCurrency();

      expect(formatAmount(50.25)).toBe("XAF 50.25");
    });

    it("should handle zero amounts", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "EUR",
      };

      const { formatAmount } = useCurrency();

      expect(formatAmount(0)).toBe("€ 0");
    });

    it("should handle negative amounts", () => {
      mockAuthStore.user = {
        id: "1",
        email: "test@example.com",
        currency: "XAF",
      };

      const { formatAmount } = useCurrency();

      expect(formatAmount(-25.5)).toBe("XAF -25.50");
    });
  });
});
