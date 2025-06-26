import en from '../translations/en.json';
import es from '../translations/es.json';

type TranslationKey = keyof typeof en;
type Language = 'en' | 'es';

const translations = {
  en,
  es,
};

let currentLanguage: Language = 'en';

export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

export const setLanguage = (language: Language) => {
  currentLanguage = language;
  localStorage.setItem('language', language);
};

export const initializeLanguage = (language?: string) => {
  const savedLanguage = localStorage.getItem('language') as Language;
  if (language && (language === 'en' || language === 'es')) {
    currentLanguage = language as Language;
    localStorage.setItem('language', currentLanguage);
  } else if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
    currentLanguage = savedLanguage;
  } else {
    // Get device language
    const deviceLanguage = navigator.language.split('-')[0];
    currentLanguage = deviceLanguage === 'es' ? 'es' : 'en';
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