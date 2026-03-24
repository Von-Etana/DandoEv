import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { ensureWallet, unlockSavings } from '@/lib/wallet';

/**
 * POST /api/wallet/withdraw
 * Request a withdrawal from Main Balance.
 */
export const POST = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    const log = logger.child({ requestId: ctx.requestId, route: 'wallet/withdraw' });

    try {
      const body = await req.json();
      const { amount } = body;

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }

      // ---- 1. Check for Active Loan Restriction (Phase 3.2) ----
      const activeLoan = await prisma.loan.findFirst({
        where: {
          userId: ctx.user.sub,
          status: {
            // Cannot withdraw if loan is still active/approved/pending review
            in: ['active', 'approved', 'under_review', 'pending', 'defaulted'],
          },
        },
      });

      if (activeLoan) {
        log.warn({ userId: ctx.user.sub, loanId: activeLoan.id }, 'Withdrawal denied: Active loan present');
        return NextResponse.json(
          { 
            error: 'Withdrawal restricted. You must complete your active loan before making withdrawals.',
            loanStatus: activeLoan.status 
          },
          { status: 403 }
        );
      }

      // ---- 2. Check Balance ----
      const wallet = await ensureWallet(prisma, ctx.user.sub);

      if (Number(wallet.mainBalance) < amount) {
        return NextResponse.json(
          { error: 'Insufficient funds in main wallet' },
          { status: 400 }
        );
      }

      // ---- 3. Process Debit (Simulated payout) ----
      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { mainBalance: { decrement: amount } },
        });

        // Insert ledger or payout record logic here
      });

      log.info({ userId: ctx.user.sub, amount }, 'Withdrawal processed');

      return NextResponse.json({
        success: true,
        message: 'Withdrawal requested successfully',
      });
    } catch (error) {
       log.error({ error }, 'Withdrawal error');
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
