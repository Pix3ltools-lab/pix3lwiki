import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/wiki', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Generate a cryptographic nonce for CSP
  const nonce = btoa(crypto.randomUUID());

  // Build connect-src dynamically (same logic as next.config.js)
  const connectSrc = [
    "'self'",
    process.env.TURSO_DATABASE_URL?.startsWith('libsql://') ? 'https://*.turso.io' : '',
  ].filter(Boolean).join(' ');

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
  ].join('; ');

  // Inject nonce into request headers so layout can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Auth redirect for protected paths
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (isProtected) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
