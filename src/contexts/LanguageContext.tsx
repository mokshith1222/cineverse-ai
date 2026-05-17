import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'hi' | 'te' | 'ta' | 'ja';

const STORAGE_KEY = 'cineverse-language';

export const languageOptions: Array<{ code: AppLanguage; label: string; nativeLabel: string }> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
];

const navLabels: Record<AppLanguage, Record<string, string>> = {
  en: {
    home: 'Home',
    movies: 'Movies',
    anime: 'Anime',
    tv: 'TV',
    trailers: 'Trailers',
    calendar: 'Calendar',
    notifications: 'Alerts',
    ott: 'OTT Tracker',
  },
  hi: {
    home: 'होम',
    movies: 'फ़िल्में',
    anime: 'ऐनिमे',
    tv: 'टीवी',
    trailers: 'ट्रेलर',
    calendar: 'कैलेंडर',
    notifications: 'अलर्ट',
    ott: 'OTT ट्रैकर',
  },
  te: {
    home: 'హోమ్',
    movies: 'సినిమాలు',
    anime: 'అనిమే',
    tv: 'టీవీ',
    trailers: 'ట్రైలర్లు',
    calendar: 'క్యాలెండర్',
    notifications: 'అలర్ట్స్',
    ott: 'OTT ట్రాకర్',
  },
  ta: {
    home: 'முகப்பு',
    movies: 'திரைப்படங்கள்',
    anime: 'அனிமே',
    tv: 'டிவி',
    trailers: 'ட்ரெய்லர்கள்',
    calendar: 'காலண்டர்',
    notifications: 'அறிவிப்புகள்',
    ott: 'OTT டிராக்கர்',
  },
  ja: {
    home: 'ホーム',
    movies: '映画',
    anime: 'アニメ',
    tv: 'TV',
    trailers: '予告編',
    calendar: 'カレンダー',
    notifications: '通知',
    ott: 'OTTトラッカー',
  },
};

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readInitialLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
    if (stored && languageOptions.some(option => option.code === stored)) return stored;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(readInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch {
      /* ignore */
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: key => navLabels[language]?.[key] ?? navLabels.en[key] ?? key,
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
