"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "ar" | "en";

const LanguageContext = createContext<{ language: Language; toggleLanguage: () => void }>({
  language: "ar",
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem("craftsman-language") as Language | null;
    if (saved === "ar" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("craftsman-language", language);
  }, [language]);

  const value = useMemo(
    () => ({ language, toggleLanguage: () => setLanguage((current) => (current === "ar" ? "en" : "ar")) }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
