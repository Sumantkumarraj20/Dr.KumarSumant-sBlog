// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi', 'ru'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
