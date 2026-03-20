import { NextRequest, NextResponse } from 'next/server';
import { rotateRefreshToken } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limiter';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'auth/refresh' });

  try {
    // ---- Rate Limiting ----
    const refreshCookie = req.cookies.get('refreshToken')?.value;
    if (!refreshCookie) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    // Extract userId from the token for rate limiting
    const userId = refreshCookie.split('.')[0];
    if (userId) {
      const rlResult = await checkRateLimit(`refresh:${userId}`, RATE_LIMITS.AUTH_REFRESH);
      if (!rlResult.allowed) {
        return rateLimitResponse(rlResult);
      }
    }

    // ---- Rotate Token ----
    const result = await rotateRefreshToken(refreshCookie);

    if (!result) {
      log.warn({ userId }, 'Refresh token rotation failed — possible reuse attack');
      // Clear cookies on failed rotation
      const response = NextResponse.json(
        { error: 'Invalid refresh token. Please sign in again.' },
        { status: 401 }
      );
      response.cookies.delete('refreshToken');
      response.cookies.delete('token');
      return response;
    }

    log.info({ userId }, 'Token rotated successfully');

    const response = NextResponse.json({
      success: true,
      accessToken: result.accessToken,
    });

    // Set new refresh token
    response.cookies.set({
      name: 'refreshToken',
      value: result.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    // Update access token cookie
    response.cookies.set({
      name: 'token',
      value: result.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    log.error({ error }, 'Refresh error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
