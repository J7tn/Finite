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

type TranslationKey = keyof typeof en;
type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'pt' | 'it';

const translations = {
  en,
  es,
  fr,
  de,
  zh,
  ja,
  ko,
  pt,
  it,
};

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = () => {
      const savedLanguage = localStorage.getItem('language') as Language;
      const supportedLanguages: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'it'];

      if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      } else {
        // Get device language
        const deviceLanguage = navigator.language.split('-')[0];
        const initialLanguage = supportedLanguages.includes(deviceLanguage as Language)
          ? deviceLanguage as Language
          : 'en';
        setLanguageState(initialLanguage);
        localStorage.setItem('language', initialLanguage);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): any => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }

    return value;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Export t function for backward compatibility
export const t = (key: string): string => {
  console.warn('Using deprecated t function. Use useTranslation hook instead.');
  return key;
};