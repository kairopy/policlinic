import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { es } from '../i18n/es';

type Language = 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries = {
  es,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    const keys = key.split('.');
    let translation: unknown = dictionaries[language];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in (translation as Record<string, unknown>)) {
        translation = (translation as Record<string, unknown>)[k];
      } else {
        return key; // return key if translation path is missing
      }
    }
    
    return typeof translation === 'string' ? translation : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
