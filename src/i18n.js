import { createI18n } from "vue-i18n";
import messages from "@/locales";

const savedLanguage = localStorage.getItem("language") || "en";

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: "en",
  messages,
  globalInjection: true,
});

export default i18n;

