"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "zh" | "en";

interface LanguageValue {
  language: Language;
  isZh: boolean;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("cell-language");
      if (saved === "en") setLanguage("en");
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    if (hydrated) window.localStorage.setItem("cell-language", language);
  }, [hydrated, language]);

  return <LanguageContext.Provider value={{ language, isZh: language === "zh", setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
