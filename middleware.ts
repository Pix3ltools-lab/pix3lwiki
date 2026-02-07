import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/wiki/new', '/admin'];
const protectedPatterns = [/^\/wiki\/[^/]+\/edit$/];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtected =
    protectedPaths.some(path => pathname.startsWith(path)) ||
    protectedPatterns.some(pattern => pattern.test(pathname));

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/wiki/new', '/wiki/:slug/edit', '/admin/:path*'],
};
