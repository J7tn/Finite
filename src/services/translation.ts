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

let currentLanguage: Language = 'en';

export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

export const setLanguage = (language: Language) => {
  currentLanguage = language;
  localStorage.setItem('language', language);
};

export const initializeLanguage = async (language?: string) => {
  const savedLanguage = localStorage.getItem('language') as Language;
  const supportedLanguages: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'it'];
  
  if (language && supportedLanguages.includes(language as Language)) {
    currentLanguage = language as Language;
    localStorage.setItem('language', currentLanguage);
  } else if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  } else {
    // Get device language
    const deviceLanguage = navigator.language.split('-')[0];
    currentLanguage = supportedLanguages.includes(deviceLanguage as Language) ? deviceLanguage as Language : 'en';
    localStorage.setItem('language', currentLanguage);
  }
};

export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}; 