import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Lang, Translation, translations } from "./translations";

const STORAGE_KEY = "iya-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: Translation;
  fmt: (n: number) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  tr: translations.en,
  fmt: (n) => String(n),
});

function initialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "fr" || saved === "en" || saved === "ar" ? saved : "en";
}

const NUMBER_LOCALE: Record<Lang, string> = { ar: "ar-MA", fr: "fr-FR", en: "en-US" };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    setLang,
    tr: translations[lang],
    fmt: (n) => n.toLocaleString(NUMBER_LOCALE[lang]),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
