import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateRequest, sanitizeObject } from '@/lib/validate';
import { signupSchema } from '@/lib/schemas';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const log = logger.child({ requestId, route: 'auth/signup' });

  try {
    // ---- Rate Limiting ----
    const ip = getClientIp(req);
    const rlResult = await checkRateLimit(`signup:${ip}`, RATE_LIMITS.AUTH_SIGNUP);
    if (!rlResult.allowed) {
      return rateLimitResponse(rlResult);
    }

    // ---- Input Validation ----
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const validation = validateRequest(signupSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const data = sanitizeObject(validation.data!);

    // ---- Check for existing user ----
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // ---- Create User ----
    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        passwordHash,
        role: 'customer',
        customerStatus: 'registered',
        kycStatus: 'pending',
        isEmailVerified: false,
        isPhoneVerified: false,
        twoFactorEnabled: false,
      },
    });

    log.info({ userId: user.id }, 'User created successfully');

    // ---- Issue Token Pair ----
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = await generateRefreshToken(user.id);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Also set access token cookie for backward compatibility
    response.cookies.set({
      name: 'token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    log.error({ error }, 'Signup error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
