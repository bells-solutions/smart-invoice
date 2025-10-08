import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import {
  getCurrencySymbol,
  formatCurrency,
  type CurrencyCode,
} from "@/utils/currency";

export function useCurrency() {
  const authStore = useAuthStore();

  const userCurrency = computed<CurrencyCode>(() => {
    return (authStore.user?.currency as CurrencyCode) || "XAF";
  });

  const currencySymbol = computed(() => {
    return getCurrencySymbol(userCurrency.value);
  });

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, userCurrency.value);
  };

  return {
    userCurrency,
    currencySymbol,
    formatAmount,
  };
}
