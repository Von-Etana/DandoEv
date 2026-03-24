import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getClientIp, type ApiContext } from '@/lib/api-handler';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limiter';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * POST /api/kyc/initiate
 * Initiates an Identity Verification session with a fictional 3rd party (e.g., SmileID / Onfido).
 */
export const POST = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    const log = logger.child({ requestId: ctx.requestId, route: 'kyc/initiate' });

    try {
      // ---- Rate Limiting ----
      const ip = getClientIp(req);
      const rlResult = await checkRateLimit(`kyc-initiate:${ip}`, RATE_LIMITS.API_AUTHENTICATED);
      if (!rlResult.allowed) {
        return rateLimitResponse(rlResult);
      }

      const user = await prisma.user.findUnique({
        where: { id: ctx.user.sub },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.kycStatus === 'verified') {
        return NextResponse.json({ error: 'User is already verified' }, { status: 400 });
      }

      // --- Mocking a Third-party KYC Provider Request (e.g., SmileID/Onfido) ---
      const mockVerificationSessionId = `kyc_sess_${crypto.randomUUID()}`;
      const mockProviderUrl = `https://verify.mock-identity-provider.com/session/${mockVerificationSessionId}`;

      // Create an intermediate document request tracker
      await prisma.kycDocument.create({
         data: {
            userId: ctx.user.sub,
            type: 'national_id',
            fileUrl: mockProviderUrl,
            verificationStatus: 'pending',
         }
      });

      // Update user status
      await prisma.user.update({
         where: { id: ctx.user.sub },
         data: { kycStatus: 'pending' },
      });

      log.info({ userId: ctx.user.sub, kycSessionId: mockVerificationSessionId }, 'KYC session initiated');

      return NextResponse.json({
        success: true,
        message: 'KYC Verification initiated successfully',
        data: {
           sessionId: mockVerificationSessionId,
           verificationUrl: mockProviderUrl,
           provider: 'MockIdentity',
        },
      });

    } catch (error) {
      log.error({ error }, 'KYC initiate failed');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
