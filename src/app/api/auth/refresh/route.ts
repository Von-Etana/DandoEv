import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limiter';
import { supabaseAdmin } from '@/lib/supabase';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'auth/refresh' });

  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    // Rate limiting (simplified for now as we don't have decoded sub readily available)
    const rlResult = await checkRateLimit(`refresh:${refreshToken.slice(-10)}`, RATE_LIMITS.AUTH_REFRESH);
    if (!rlResult.allowed) return rateLimitResponse(rlResult);

    // ---- Refresh via Supabase ----
    const { data: authData, error: authError } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (authError || !authData.session) {
      log.warn({ error: authError?.message }, 'Token refresh failed');
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('refreshToken');
      response.cookies.delete('token');
      return response;
    }

    const response = NextResponse.json({
      success: true,
      accessToken: authData.session.access_token,
    });

    // Update Cookies
    response.cookies.set({
      name: 'token',
      value: authData.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: authData.session.expires_in,
    });

    if (authData.session.refresh_token) {
      response.cookies.set({
        name: 'refreshToken',
        value: authData.session.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;

  } catch (error: any) {
    log.error({ error: error.message }, 'Refresh error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
