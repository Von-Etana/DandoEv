import { NextRequest, NextResponse } from 'next/server';
import { revokeTokenFamily, verifyAccessToken, extractBearerToken } from '@/lib/auth';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'auth/signout' });

  try {
    // Get refresh token to identify the family to revoke
    const refreshCookie = req.cookies.get('refreshToken')?.value;
    const authHeader = req.headers.get('authorization');
    const accessToken = extractBearerToken(authHeader) || req.cookies.get('token')?.value;

    let userId: string | null = null;
    let familyId: string | null = null;

    // Try to get userId from access token
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        userId = payload.sub;
      } catch {
        // Access token expired — still allow logout via refresh token
      }
    }

    // Extract userId and familyId from refresh token
    if (refreshCookie) {
      const parts = refreshCookie.split('.');
      if (parts.length === 3) {
        userId = userId || parts[0];
        familyId = parts[1];
      }
    }

    // Revoke the token family
    if (userId && familyId) {
      await revokeTokenFamily(userId, familyId);
      log.info({ userId }, 'Token family revoked on signout');
    }

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });

    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set({
      name: 'refreshToken',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    log.error({ error }, 'Signout error');
    // Even on error, clear cookies
    const response = NextResponse.json({ success: true, message: 'Signed out' });
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    return response;
  }
}
