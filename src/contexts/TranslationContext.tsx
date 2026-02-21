import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../translations/en.json';
import es from '../translations/es.json';
import fr from '../translations/fr.json';
import de from '../translations/de.json';
import zh from '../translations/zh.json';
import ja from '../translations/ja.json';
import ko from '../translations/ko.json';
import pt from '../translations/pt.json';
import it from '../translations/it.json';

type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'pt' | 'it';

const translations: Record<Language, unknown> = { en, es, fr, de, zh, ja, ko, pt, it };

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'it'];

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  tArray: (key: string) => string[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      const deviceLanguage = navigator.language.split('-')[0];
      const initialLanguage = SUPPORTED_LANGUAGES.includes(deviceLanguage as Language)
        ? deviceLanguage as Language
        : 'en';
      setLanguageState(initialLanguage);
      localStorage.setItem('language', initialLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const resolve = (key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return undefined;
      }
    }
    return value;
  };

  const t = (key: string): string => {
    const value = resolve(key);
    if (typeof value === 'string') return value;
    if (value === undefined) return key;
    return key;
  };

  const tArray = (key: string): string[] => {
    const value = resolve(key);
    if (Array.isArray(value) && value.every(v => typeof v === 'string')) return value;
    return [];
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, tArray }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
