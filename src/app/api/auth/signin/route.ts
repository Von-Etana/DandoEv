import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateRequest } from '@/lib/validate';
import { signinSchema } from '@/lib/schemas';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

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

    // ---- Rate Limiting (by IP + email combo) ----
    const ip = getClientIp(req);
    const rlResult = await checkRateLimit(
      `signin:${ip}:${email}`,
      RATE_LIMITS.AUTH_SIGNIN
    );
    if (!rlResult.allowed) {
      return rateLimitResponse(rlResult);
    }

    // ---- Authenticate ----
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 401 with generic message (don't reveal whether email exists)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    log.info({ userId: user.id }, 'User signed in');

    // ---- Issue Token Pair ----
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = await generateRefreshToken(user.id);

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
    });

    // Set refresh token as httpOnly cookie
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    // Access token cookie (backward compat)
    response.cookies.set({
      name: 'token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    log.error({ error }, 'Signin error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
