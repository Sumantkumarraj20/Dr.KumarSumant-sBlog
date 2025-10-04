// pages/_app.tsx - Keep your existing, just remove Head
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/authContext";
import { appWithTranslation } from "next-i18next";
import { LanguageProvider } from "../context/languageContext";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { ChunkErrorBoundary } from "../components/ChunkErrorBoundary";
import "prosemirror-view/style/prosemirror.css";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

const ChunkErrorFallback = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    <h1>Loading Application</h1>
    <button onClick={() => window.location.reload()}>
      Refresh Page
    </button>
  </div>
);

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
  return <AppContent {...props} />;
}

export default appWithTranslation(App);