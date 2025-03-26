import type { ReactNode } from "react";

import { createContext, useContext, useEffect, useState } from "react";

import ar from "../locales/ar/translation.json";
import da from "../locales/da/translation.json";
import de from "../locales/de/translation.json";
import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import fi from "../locales/fi/translation.json";
import fr from "../locales/fr/translation.json";
import hi from "../locales/hi/translation.json";
import id from "../locales/id/translation.json";
import it from "../locales/it/translation.json";
import ja from "../locales/ja/translation.json";
import ko from "../locales/ko/translation.json";
import nl from "../locales/nl/translation.json";
import no from "../locales/no/translation.json";
import pl from "../locales/pl/translation.json";
import pt from "../locales/pt/translation.json";
import ru from "../locales/ru/translation.json";
import sv from "../locales/sv/translation.json";
import th from "../locales/th/translation.json";
import tr from "../locales/tr/translation.json";
import vi from "../locales/vi/translation.json";
import zhCN from "../locales/zh-CN/translation.json";
import zhTW from "../locales/zh-TW/translation.json";

// Define available languages and their native names
export const LANGUAGES = {
  "en": { name: "English", nativeName: "English" },
  "zh-CN": { name: "Simplified Chinese", nativeName: "简体中文" },
  "zh-TW": { name: "Traditional Chinese", nativeName: "繁體中文" },
  "ja": { name: "Japanese", nativeName: "日本語" },
  "ko": { name: "Korean", nativeName: "한국어" },
  "ru": { name: "Russian", nativeName: "Русский" },
  "fr": { name: "French", nativeName: "Français" },
  "es": { name: "Spanish", nativeName: "Español" },
  "de": { name: "German", nativeName: "Deutsch" },
  "it": { name: "Italian", nativeName: "Italiano" },
  "pt": { name: "Portuguese", nativeName: "Português" },
  "nl": { name: "Dutch", nativeName: "Nederlands" },
  "pl": { name: "Polish", nativeName: "Polski" },
  "tr": { name: "Turkish", nativeName: "Türkçe" },
  "ar": { name: "Arabic", nativeName: "العربية" },
  "hi": { name: "Hindi", nativeName: "हिन्दी" },
  "th": { name: "Thai", nativeName: "ไทย" },
  "vi": { name: "Vietnamese", nativeName: "Tiếng Việt" },
  "id": { name: "Indonesian", nativeName: "Bahasa Indonesia" },
  "sv": { name: "Swedish", nativeName: "Svenska" },
  "da": { name: "Danish", nativeName: "Dansk" },
  "fi": { name: "Finnish", nativeName: "Suomi" },
  "no": { name: "Norwegian", nativeName: "Norsk" },
};

// Create a map for translations
const translations = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ja,
  ko,
  ru,
  fr,
  es,
  de,
  it,
  pt,
  nl,
  pl,
  tr,
  ar,
  hi,
  th,
  vi,
  id,
  sv,
  da,
  fi,
  no,
};

export type LanguageCode = keyof typeof LANGUAGES;

// Context interface
type I18nContextType = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
  availableLanguages: typeof LANGUAGES;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

type I18nProviderProps = {
  children: ReactNode;
};

// Create a function to get nested values using a path
function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let value = obj;

  for (const key of keys) {
    if (value === undefined || value === null) {
      return path; // Return the key if value is undefined
    }
    value = value[key];
  }

  return typeof value === "string" ? value : path;
}

// Create provider component
export function I18nProvider({ children }: I18nProviderProps) {
  // Initialize language from localStorage or browser preference
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem("language") as LanguageCode | null;

    if (savedLanguage && savedLanguage in LANGUAGES) {
      return savedLanguage;
    }

    // Get browser language
    const browserLanguage = navigator.language;

    // Check if the browser language or its primary language is supported
    if (browserLanguage in LANGUAGES) {
      return browserLanguage as LanguageCode;
    }

    // Check for primary language (e.g., "en" from "en-US")
    const primaryLang = browserLanguage.split("-")[0];

    // Find a matching language or use English as fallback
    const matchingLang = Object.keys(LANGUAGES).find(
      lang => lang === primaryLang || lang.startsWith(`${primaryLang}-`),
    );

    return (matchingLang as LanguageCode) || "en";
  });

  // Setter function that saves to localStorage
  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  // Translation function
  const t = (key: string): string => {
    // 使用类型断言以避免类型错误
    const currentTranslations = (translations as Record<string, any>)[language] || translations.en;
    // Attempt to get the translation
    const translation = getNestedValue(currentTranslations, key);

    // If translation is the same as the key, it wasn't found,
    // so try to get it from the English translations as fallback
    if (translation === key && language !== "en") {
      return getNestedValue(translations.en, key);
    }

    return translation;
  };

  // Set document lang attribute when language changes
  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

// Custom hook to use the i18n context
export function useI18n() {
  const context = useContext(I18nContext);

  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
