import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { useEffect } from "react";
import { initReactI18next, useTranslation } from "react-i18next";

// Available languages
export const languages = {
  "en": { nativeName: "English" },
  "zh-CN": { nativeName: "简体中文" },
  "zh-TW": { nativeName: "繁體中文" },
  "ja": { nativeName: "日本語" },
  "ko": { nativeName: "한국어" },
  "ru": { nativeName: "Русский" },
  "fr": { nativeName: "Français" },
};

// Initialize i18n if not already initialized
function setupI18n() {
  if (!i18n.isInitialized) {
    i18n
      .use(HttpBackend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: "en",
        debug: false,
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ["navigator", "htmlTag", "localStorage", "path", "subdomain"],
          caches: ["localStorage"],
        },
        backend: {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
      });
  }
}

// Custom hook to handle internationalization
function useI18n() {
  const { t, i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    setupI18n();
  }, []);

  // Change language function
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return {
    t,
    i18n: i18nInstance,
    currentLanguage: i18n.language,
    changeLanguage,
    languages,
  };
}

export default useI18n;
