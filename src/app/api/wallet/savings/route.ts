import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { ensureWallet } from '@/lib/wallet';

/**
 * GET /api/wallet/savings
 * View Locked Savings and Unlock status.
 */
export const GET = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const wallet = await ensureWallet(prisma, ctx.user.sub);

      const activeLoan = await prisma.loan.findFirst({
        where: { userId: ctx.user.sub, status: { in: ['active', 'approved'] } },
        include: { repayments: { orderBy: { dueDate: 'desc' }, take: 1 } },
      });

      const nextUnlockDate = activeLoan?.repayments[0]?.dueDate || null;

      return NextResponse.json({
        success: true,
        data: {
          mainBalance: Number(wallet.mainBalance),
          lockedSaving: Number(wallet.lockedSaving),
          savedSoFar: Number(wallet.lockedSaving), // Helper mapping name
          lockedUntil: nextUnlockDate ? nextUnlockDate.toISOString() : 'No active restriction',
          loanStatus: activeLoan?.status || 'none',
        },
      });
    } catch (error) {
      logger.error({ error, userId: ctx.user.sub }, 'Savings fetch error');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
