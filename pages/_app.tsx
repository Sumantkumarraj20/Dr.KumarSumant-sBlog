import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/authContext';
import { appWithTranslation } from 'next-i18next';
import { LanguageProvider } from '../context/languageContext';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({});

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <LanguageProvider>
          <Component {...pageProps} />
        </LanguageProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(App);