import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../locales/en.json";
import es from "../locales/es.json";
import sv from "../locales/sv.json";
import de from "../locales/de.json";

export const resources = {
  en: { translation: en },
  es: { translation: es },
  sv: { translation: sv },
  de: { translation: de },
} as const;

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "sv", name: "Svenska" },
  { code: "de", name: "Deutsch" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

// Get device language, fallback to 'en'
const getDeviceLanguage = (): LanguageCode => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? "en";
  const supportedLanguage = LANGUAGES.find((l) => l.code === deviceLocale);
  return supportedLanguage ? supportedLanguage.code : "en";
};

export const initI18n = (storedLanguage?: LanguageCode | null) => {
  const language = storedLanguage || getDeviceLanguage();

  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v4",
  });

  return i18n;
};

export default i18n;
