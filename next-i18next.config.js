// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'hi',
    locales: ['hi', 'en', 'ru'], 
    // Next.js requires a literal boolean here; set to false to avoid invalid config warning.
    localeDetection: false,
  },
  react: { useSuspense: false },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
