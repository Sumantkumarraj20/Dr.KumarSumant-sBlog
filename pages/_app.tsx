
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../context/authContext';
import { appWithTranslation } from 'next-i18next'

function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default appWithTranslation(App);
