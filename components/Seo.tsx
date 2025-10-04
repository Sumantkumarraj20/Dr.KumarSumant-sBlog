// components/SEO.tsx - Keep your existing, just remove duplicate viewport
'use client';

import Head from 'next/head';
import { useMemo } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

const DEFAULT_SEO = {
  title: "Dr. Kumar Sumant - Medical Education & Healthcare Insights",
  description: "Expert medical education, healthcare insights, and interactive learning resources by Dr. Kumar Sumant. Dedicated to delivering cost-optimized, socially justified, and patient-oriented healthcare with a dream to be a most renowned surgeon.",
  canonical: "https://dr-kumar-sumant.vercel.app",
  ogImage: "https://dr-kumar-sumant.vercel.app/og-image.jpg",
  siteName: "Dr. Kumar Sumant",
  author: "Dr. Kumar Sumant",
  linkedinProfile: "https://www.linkedin.com/in/drsumantk",
  keywords: "medical education, healthcare, surgery, cardiothoracic surgery, medical research, cost-effective healthcare, patient care, surgical education",
} as const;

export default function SEO({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  canonical = DEFAULT_SEO.canonical,
  ogImage = DEFAULT_SEO.ogImage,
  ogType = 'website',
  keywords = DEFAULT_SEO.keywords,
  publishedTime,
  modifiedTime,
  author = DEFAULT_SEO.author,
  section = "Medical Education",
  tags = ["medical", "education", "healthcare", "surgery", "cardiology"],
  noindex = false,
  nofollow = false,
}: SEOProps) {
  
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": ogType === 'article' ? "Article" : "MedicalWebPage",
    "name": title,
    "description": description,
    "url": canonical,
    "author": {
      "@type": "Person",
      "name": author,
      "jobTitle": "Cardiothoracic Surgeon",
      "url": DEFAULT_SEO.linkedinProfile,
      "sameAs": DEFAULT_SEO.linkedinProfile
    },
    "publisher": {
      "@type": "Organization",
      "name": DEFAULT_SEO.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": "https://dr-kumar-sumant.vercel.app/android-chrome-192x192.png",
        "width": 192,
        "height": 192
      }
    },
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    ...(ogType === 'article' && {
      "datePublished": publishedTime,
      "dateModified": modifiedTime,
      "articleSection": section,
      "keywords": tags.join(', ')
    })
  }), [title, description, canonical, ogType, publishedTime, modifiedTime, section, tags, author]);

  const robotsContent = useMemo(() => {
    if (noindex && nofollow) return 'noindex, nofollow';
    if (noindex) return 'noindex, follow';
    if (nofollow) return 'index, nofollow';
    return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  }, [noindex, nofollow]);

  return (
    <Head>
      {/* Essential Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={DEFAULT_SEO.siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* LinkedIn Specific */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:see_also" content={DEFAULT_SEO.linkedinProfile} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article Specific */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {section && (
        <meta property="article:section" content={section} />
      )}
      {tags.map((tag, index) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* REMOVED viewport meta tag - handled by _app.tsx */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="x-ua-compatible" content="IE=edge" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        key={`structured-data-${ogType}`}
      />

      {/* Preload Critical Resources */}
      <link rel="preconnect" href="https://www.linkedin.com" />
      <link rel="dns-prefetch" href="https://www.linkedin.com" />
    </Head>
  );
}

// Your existing helper components remain the same
export function ArticleSEO({
  title,
  description,
  canonical,
  ogImage,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
}: Omit<SEOProps, 'ogType'>) {
  return (
    <SEO
      title={title}
      description={description}
      canonical={canonical}
      ogImage={ogImage}
      ogType="article"
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      author={author}
      section={section}
      tags={tags}
    />
  );
}

export function MedicalArticleSEO({
  title,
  description,
  canonical,
  ogImage,
  publishedTime,
  modifiedTime,
  tags = [],
}: Omit<SEOProps, 'ogType' | 'section' | 'author'>) {
  return (
    <ArticleSEO
      title={title}
      description={description}
      canonical={canonical}
      ogImage={ogImage}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      section="Medical Education"
      tags={[...tags, "medical", "healthcare", "surgery"]}
    />
  );
}