import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/validate';
import { signinSchema } from '@/lib/schemas';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/api-handler';
import { supabaseAdmin } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const log = logger.child({ requestId, route: 'auth/signin' });

  try {
    // ---- Input Validation ----
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const validation = validateRequest(signinSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // ---- Rate Limiting ----
    const ip = getClientIp(req);
    const rlResult = await checkRateLimit(`signin:${ip}:${email}`, RATE_LIMITS.AUTH_SIGNIN);
    if (!rlResult.allowed) {
      return rateLimitResponse(rlResult);
    }

    // ---- Authenticate via Supabase ----
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      log.warn({ email, error: authError?.message }, 'Invalid credentials attempt');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login in local DB
    await prisma.user.update({
      where: { id: authData.user.id },
      data: { lastLoginAt: new Date() },
    });

    log.info({ userId: authData.user.id }, 'User signed in via Supabase');

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: authData.user.user_metadata?.firstName,
        lastName: authData.user.user_metadata?.lastName,
        role: authData.user.app_metadata?.role || 'customer',
      },
      accessToken: authData.session.access_token,
    });

    // Set Supabase session cookies
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
    log.error({ error: error.message }, 'Signin error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
