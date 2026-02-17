import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth/auth';
import { sanitizeInput, checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '@/lib/auth/rateLimit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Check rate limit before attempting login
    const rateCheck = await checkRateLimit(sanitizedEmail, 'login');
    if (!rateCheck.allowed) {
      const response = NextResponse.json({ error: rateCheck.error }, { status: 429 });
      if (rateCheck.retryAfter) {
        response.headers.set('Retry-After', String(rateCheck.retryAfter));
      }
      return response;
    }

    const result = await login(email, password);

    if ('error' in result) {
      await recordFailedAttempt(sanitizedEmail, 'login');
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await clearFailedAttempts(sanitizedEmail, 'login');

    const response = NextResponse.json({ user: result.user });
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    return response;
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
