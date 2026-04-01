// ============================================================
// API Handler — Composable Middleware Chain
// - withAuth()        → Verify JWT, attach user to context
// - withRoles()       → RBAC check
// - withRateLimit()   → Per-tier rate limiting
// - withValidation()  → Zod schema validation
// - withIdempotency() → Idempotency key handling
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseToken, extractBearerToken, type JwtPayload } from './auth';
import { checkRateLimit, rateLimitResponse, type RateLimitConfig } from './rate-limiter';
import { validateRequest } from './validate';
import { checkIdempotencyKey, storeIdempotencyResponse } from './idempotency';
import { createRequestLogger } from './logger';
import { ZodSchema } from 'zod';
import crypto from 'crypto';

// ---- Extended Request Context ----

export interface ApiContext {
  user: JwtPayload;
  requestId: string;
  body?: unknown;
  params?: any;
}

type ApiHandler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>;

// ---- withAuth: Require valid access token ----

export function withAuth(handler: ApiHandler): (req: NextRequest, nextCtx?: any) => Promise<NextResponse> {
  return async (req: NextRequest, nextCtx?: any) => {
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

    // Try Authorization header first, then cookie fallback
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader) || req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const payload = await verifySupabaseToken(token);
      if (!payload) throw new Error('Invalid token');
      return handler(req, { user: payload, requestId, params: nextCtx?.params });
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }
  };
}

// ---- withRoles: Require specific user roles ----

export function withRoles(
  roles: string[],
  handler: ApiHandler
): (req: NextRequest, nextCtx?: any) => Promise<NextResponse> {
  return withAuth(async (req, ctx) => {
    if (!roles.includes(ctx.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    return handler(req, ctx);
  });
}

// ---- withRateLimit: Apply rate limiting tier ----

export function withRateLimit(
  config: RateLimitConfig,
  identifierFn: (req: NextRequest, ctx?: ApiContext) => string,
  handler: (req: NextRequest, ctx?: ApiContext) => Promise<NextResponse>
): (req: NextRequest, ctx?: ApiContext) => Promise<NextResponse> {
  return async (req: NextRequest, ctx?: ApiContext) => {
    const identifier = identifierFn(req, ctx);
    const result = await checkRateLimit(identifier, config);

    if (!result.allowed) {
      return rateLimitResponse(result);
    }

    const response = await handler(req, ctx);
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    return response;
  };
}

// ---- withValidation: Validate request body with Zod ----

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, ctx: ApiContext & { validatedBody: T }) => Promise<NextResponse>
): ApiHandler {
  return async (req: NextRequest, ctx: ApiContext) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const result = validateRequest(schema, body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.errors },
        { status: 400 }
      );
    }

    return handler(req, { ...ctx, validatedBody: result.data! });
  };
}

// ---- withIdempotency: Handle idempotent POST requests ----

export function withIdempotency(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, ctx: ApiContext) => {
    const idempotencyKey = req.headers.get('idempotency-key');

    if (!idempotencyKey) {
      // If no key provided, proceed without idempotency
      return handler(req, ctx);
    }

    const endpoint = new URL(req.url).pathname;
    const cached = await checkIdempotencyKey(idempotencyKey, ctx.user.sub, endpoint);

    if (cached.isDuplicate) {
      const log = createRequestLogger(ctx.requestId, endpoint);
      log.info({ idempotencyKey }, 'Returning cached idempotent response');
      return NextResponse.json(cached.cachedResponseBody, {
        status: cached.cachedResponseCode,
      });
    }

    const response = await handler(req, ctx);

    // Store the response for future duplicate requests
    const responseBody = await response.clone().json().catch(() => null);
    await storeIdempotencyResponse(
      idempotencyKey,
      ctx.user.sub,
      endpoint,
      response.status,
      responseBody
    );

    return response;
  };
}

// ---- Helper: Get client IP from request ----

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
