import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/authContext';
import { appWithTranslation } from 'next-i18next';
import { LanguageProvider } from '../context/languageContext';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { ChunkErrorBoundary } from '../components/chunkerrorboundary';
import Head from 'next/head';
import 'prosemirror-view/style/prosemirror.css';

const theme = extendTheme({});

// Custom fallback component for chunk errors
const ChunkErrorFallback = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center'
  }}>
    <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading Application</h1>
    <p style={{ marginBottom: '20px' }}>Please wait while we load the latest version...</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        padding: '10px 20px',
        backgroundColor: '#3182CE',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      Refresh Page
    </button>
  </div>
);

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3182CE" />
        <link rel="canonical" href="https://dr-kumar-sumant.vercel.app/" />
      </Head>
      <ChunkErrorBoundary fallback={<ChunkErrorFallback />}>
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <LanguageProvider>
              <Component {...pageProps} />
            </LanguageProvider>
          </AuthProvider>
        </ChakraProvider>
      </ChunkErrorBoundary>
    </>
  );
}

export default appWithTranslation(App);