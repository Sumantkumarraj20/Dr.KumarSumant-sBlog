// middleware.js
import { NextResponse } from 'next/server';
import { generateSecurityHeaders } from './lib/security-headers';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Apply all security headers from centralized function
  const securityHeaders = generateSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Remove server information for security
  response.headers.set('Server', 'Protected');

  return response;
}

export const config = {
   matcher: [
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};