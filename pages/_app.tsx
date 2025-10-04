// pages/_app.tsx - Optimized
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/authContext";
import { appWithTranslation } from "next-i18next";
import { LanguageProvider } from "../context/languageContext";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { ChunkErrorBoundary } from "../components/ChunkErrorBoundary";
import Head from "next/head";
import "prosemirror-view/style/prosemirror.css";
import { useTranslation } from "next-i18next";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

const ChunkErrorFallback = () => {
  const { t } = useTranslation('common');
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>{t('loading') || 'Loading Application'}</h1>
      <button onClick={() => window.location.reload()}>
        {t('refresh') || 'Refresh Page'}
      </button>
    </div>
  );
};

function AppContent({ Component, pageProps }: AppProps) {
  return (
    <ChunkErrorBoundary fallback={<ChunkErrorFallback />}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <LanguageProvider>
            <Component {...pageProps} />
          </LanguageProvider>
        </AuthProvider>
      </ChakraProvider>
    </ChunkErrorBoundary>
  );
}

function App(props: AppProps) {
  // Get the current locale from page props
  const { locale } = props.pageProps;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3182CE" />
        <link rel="canonical" href="https://dr-kumar-sumant.vercel.app/" />
        
        {/* Optional: Add language alternate links for SEO */}
        {locale && (
          <link 
            rel="alternate" 
            hrefLang={locale} 
            href={`https://dr-kumar-sumant.vercel.app/${locale}`} 
          />
        )}
        <link 
          rel="alternate" 
          hrefLang="x-default" 
          href="https://dr-kumar-sumant.vercel.app/" 
        />
      </Head>
      <AppContent {...props} />
    </>
  );
}

export default appWithTranslation(App);