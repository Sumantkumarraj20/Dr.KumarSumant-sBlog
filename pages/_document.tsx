// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://bgxrjlcjofkmwdifmfhk.supabase.co" />
          
          {/* If you have external scripts, add integrity hashes */}
          {/* 
          <script 
            src="https://example.com/script.js"
            integrity="sha384-..."
            crossOrigin="anonymous"
          />
          */}
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