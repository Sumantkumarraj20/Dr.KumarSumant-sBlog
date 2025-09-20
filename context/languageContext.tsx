import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface LanguageContextProps {
  language: string;
  changeLanguage: (lng: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { i18n } = useTranslation(); // <-- safe initialized i18n
  const [language, setLanguage] = useState(i18n.language || 'en');

  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
      setLanguage(lng);
      router.push(router.pathname, router.asPath, { locale: lng, scroll: false });
    }
  };

  useEffect(() => {
    // Make sure i18n is initialized before calling changeLanguage
    if (router.locale && router.locale !== language && i18n.isInitialized) {
      i18n.changeLanguage(router.locale);
      setLanguage(router.locale);
    }
  }, [router.locale, i18n.isInitialized]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
