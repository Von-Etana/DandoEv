import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, sanitizeObject } from '@/lib/validate';
import { signupSchema } from '@/lib/schemas';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/api-handler';
import { supabaseAdmin } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import crypto from 'crypto';

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

    // ---- Create User in Supabase Auth ----
    const authData = await prisma.$transaction(async (tx) => {
        // 1. Create in Supabase 
        const { data: sData, error: sError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'customer'
            }
        });

        if (sError) throw sError;

        // 2. Create in our local User table for profile data
        const user = await tx.user.create({
            data: {
                id: sData.user.id, // Use the same UUID from Supabase
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone || null,
                passwordHash: 'SUPABASE_AUTH', 
                role: 'customer',
                customerStatus: 'registered',
            },
        });

        return { user, authUser: sData.user };
    });

    log.info({ userId: authData.user.id }, 'User created successfully with Supabase Auth');

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please sign in.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: authData.user.firstName,
        lastName: authData.user.lastName,
        role: authData.user.role,
      }
    });

  } catch (error: any) {
    log.error({ error: error.message }, 'Signup error');
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
