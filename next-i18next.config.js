// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'hi',
    locales: ['hi', 'en', 'ru'], 
    localeDetection: true,
  },
  react: { useSuspense: false },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
