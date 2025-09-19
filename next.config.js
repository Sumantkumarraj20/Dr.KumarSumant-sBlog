// next.config.js
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  i18n,
  allowedDevOrigins: ['http://10.29.67.118:3000'],
};

module.exports = nextConfig;
