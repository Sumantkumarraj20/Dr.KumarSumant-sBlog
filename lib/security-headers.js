// lib/security-headers.js
export function generateSecurityHeaders() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Content Security Policy with Cloudinary support
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "connect-src 'self' https://bgxrjlcjofkmwdifmfhk.supabase.co https://va.vercel-scripts.com https://api.cloudinary.com",
    "media-src 'self' https://res.cloudinary.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    isProduction ? "upgrade-insecure-requests" : ""
  ].filter(Boolean).join("; ");

  return {
    // Content Security Policy
    'Content-Security-Policy': cspDirectives,
    
    // XSS Protection
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer and Transport Security
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    
    // Permissions and Cross-Origin Policies
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    
    // Performance and Others
    'X-DNS-Prefetch-Control': 'on',
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
}