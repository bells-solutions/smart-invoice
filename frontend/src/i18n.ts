import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem("user-language") || "en", // Default language or saved preference
  fallbackLocale: "en",
  messages: {
    en,
    fr,
  },
});
