import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
// Don't call useTranslation at module/top-level to avoid NO_I18NEXT_INSTANCE during SSR

interface LanguageContextProps {
  language: string;
  changeLanguage: (lng: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [language, setLanguage] = useState(router.locale || 'en');

  const changeLanguage = (lng: string) => {
    // Use Next router to change locale; let next-i18next handle i18n initialization
    if (router.locale !== lng) {
      setLanguage(lng);
      router.push(router.pathname, router.asPath, { locale: lng, scroll: false });
    }
  };

  useEffect(() => {
    // sync language state with router.locale once router is available
    if (router.locale && router.locale !== language) {
      setLanguage(router.locale);
    }
  }, [router.locale]);

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
