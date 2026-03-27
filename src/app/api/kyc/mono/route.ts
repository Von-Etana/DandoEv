import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import { exchangeMonoToken, getMonoIdentity, getMonoStatement } from '@/lib/mono';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * POST /api/kyc/mono/exchange
 * Exchange a Mono public code from the Connect widget for an account_id.
 * Also fetches identity and stores it in the DB.
 */
export const POST = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    const log = logger.child({ requestId: ctx.requestId, route: 'kyc/mono/exchange' });

    try {
      const body = await req.json();
      const { code } = body;

      if (!code) {
        return NextResponse.json({ error: 'Mono code is required' }, { status: 400 });
      }

      // 1. Exchange code → accountId
      const { id: accountId } = await exchangeMonoToken(code);
      log.info({ userId: ctx.user.sub, accountId }, 'Mono token exchanged');

      // 2. Fetch identity data from Mono
      const identity = await getMonoIdentity(accountId);

      // 3. Save to user record (cast to any until migration regenerates types)
      await (prisma.user as any).update({
        where: { id: ctx.user.sub },
        data: {
          monoAccountId: accountId,
          monoStatus: 'linked',
          // Pre-fill BVN if Mono provides it
          ...(identity.bvn ? { bvn: identity.bvn } : {}),
        },
      });

      // 4. Update KYC status to pending verification
      await prisma.user.update({
        where: { id: ctx.user.sub },
        data: { kycStatus: 'pending' },
      });

      log.info({ userId: ctx.user.sub }, 'Mono identity linked successfully');

      return NextResponse.json({
        success: true,
        message: 'Bank account linked via Mono. Identity verified.',
        data: {
          accountId,
          name: identity.name,
          bvn: identity.bvn ? '***' + identity.bvn.slice(-4) : null,
        },
      });
    } catch (error: any) {
      log.error({ error: error.message }, 'Mono KYC exchange failed');
      return NextResponse.json({ error: 'Failed to link account. Please try again.' }, { status: 500 });
    }
  }
);

/**
 * GET /api/kyc/mono/exchange
 * Fetch the pre-analysed bank statement for the current user's linked Mono account.
 */
export const GET = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    const log = logger.child({ requestId: ctx.requestId, route: 'kyc/mono/statement' });

    try {
      const user = await (prisma.user as any).findUnique({ where: { id: ctx.user.sub } }) as any;

      if (!user?.monoAccountId) {
        return NextResponse.json({ error: 'No Mono account linked. Please complete the bank linking step.' }, { status: 404 });
      }

      const statement = await getMonoStatement(user.monoAccountId, 6);
      log.info({ userId: ctx.user.sub }, 'Bank statement fetched');

      // Update status
      await (prisma.user as any).update({
        where: { id: ctx.user.sub },
        data: { monoStatus: 'statement_fetched' },
      });

      return NextResponse.json({
        success: true,
        data: {
          averageMonthlyCredit: statement.averageMonthlyCredit,
          averageMonthlyDebit: statement.averageMonthlyDebit,
          totalCredits: statement.totalCredits,
          totalDebits: statement.totalDebits,
          monthsAnalysed: statement.monthsAnalysed,
        },
      });
    } catch (error: any) {
      log.error({ error: error.message }, 'Mono statement fetch failed');
      return NextResponse.json({ error: 'Failed to fetch bank statement.' }, { status: 500 });
    }
  }
);
