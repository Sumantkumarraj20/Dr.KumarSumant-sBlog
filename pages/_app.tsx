import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/authContext';
import { appWithTranslation } from 'next-i18next';
import { LanguageProvider } from '../context/languageContext';

function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default appWithTranslation(App);