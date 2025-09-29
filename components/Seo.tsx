// components/Seo.tsx
import Head from "next/head";

export default function Seo({ title, description, url, image, locale }: {
  title: string; description?: string; url?: string; image?: string; locale?: string;
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      {url && <link rel="canonical" href={url} />}
      {locale && <meta property="og:locale" content={locale} />}
    </Head>
  );
}
