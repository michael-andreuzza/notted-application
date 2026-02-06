import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../locales/en.json";
import es from "../locales/es.json";
import sv from "../locales/sv.json";
import de from "../locales/de.json";
import it from "../locales/it.json";
import ru from "../locales/ru.json";
import fi from "../locales/fi.json";
import da from "../locales/da.json";
import no from "../locales/no.json";
import fr from "../locales/fr.json";

export const resources = {
  en: { translation: en },
  es: { translation: es },
  sv: { translation: sv },
  de: { translation: de },
  it: { translation: it },
  ru: { translation: ru },
  fi: { translation: fi },
  da: { translation: da },
  no: { translation: no },
  fr: { translation: fr },
} as const;

export const LANGUAGES = [
  { code: "da", name: "Dansk" },
  { code: "de", name: "Deutsch" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "no", name: "Norsk" },
  { code: "fi", name: "Suomi" },
  { code: "sv", name: "Svenska" },
  { code: "ru", name: "Русский" },
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
