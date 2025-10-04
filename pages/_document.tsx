// pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import i18nextConfig from '@/next-i18next.config';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    // Get the current locale from the page props
    const currentLocale = (this.props.__NEXT_DATA__.query.locale as string) || 
                         i18nextConfig.i18n.defaultLocale;

    return (
      <Html lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
        <Head>
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link 
            rel="preconnect" 
            href="https://fonts.gstatic.com" 
            crossOrigin="anonymous" 
          />
          <link 
            rel="preconnect" 
            href="https://bgxrjlcjofkmwdifmfhk.supabase.co" 
          />
          <link 
            rel="preconnect" 
            href="https://res.cloudinary.com" 
          />
          <link 
            rel="preconnect" 
            href="https://api.cloudinary.com" 
          />
          
          {/* Favicon and manifest */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          
          {/* REMOVED CSP meta tag - handled by middleware only */}
          {/* Keep only the referrer meta tag */}
          <meta name="referrer" content="strict-origin-when-cross-origin" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;