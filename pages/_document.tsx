// pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
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
          
          {/* Meta tags for security - these complement HTTP headers */}
          <meta httpEquiv="Content-Security-Policy" content="" />
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