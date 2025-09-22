// next.config.js
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  i18n,
  // allow the local network IPs used during development (add any additional dev origins here)
  // include common localhost and observed network addresses (with port variants)
  allowedDevOrigins: [
    'http://10.29.67.118:3000',
    'http://10.123.129.207:3000',
    'http://10.123.129.207:3001',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://10.123.129.207',
    'http://10.29.67.118',
  ],
  // no redirects configured; keep allowedDevOrigins only
};

module.exports = nextConfig;
