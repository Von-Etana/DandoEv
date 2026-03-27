import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { creditLockedSavings } from '@/lib/wallet';
import { type TxClient } from '@/lib/prisma-types';

/**
 * POST /api/admin/repayments/[id]/reconcile
 * Trigger manual clear setting of debt of individual repayment lines.
 */
export const POST = withRoles(
  ['super_admin', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    const log = logger.child({ requestId: ctx.requestId, route: 'admin/repayments/[id]/reconcile' });
    const id = req.nextUrl.pathname.split('/').slice(-2, -1)[0]; // /api/admin/repayments/[id]/reconcile

    try {
      const body = await req.json();
      const { overrideReason } = body;

      if (!overrideReason) {
         return NextResponse.json({ error: 'Reconciliation reason required' }, { status: 400 });
      }

      const repayment = await prisma.repayment.findUnique({
        where: { id },
      });

      if (!repayment) {
        return NextResponse.json({ error: 'Repayment not found' }, { status: 404 });
      }

      if (repayment.status === 'paid') {
         return NextResponse.json({ error: 'Repayment already paid' }, { status: 409 });
      }

      const remainingAmount = Number(repayment.amount) - Number(repayment.amountPaid);

      const updatedRepayment = await prisma.$transaction(async (tx: TxClient) => {
         const uR = await tx.repayment.update({
            where: { id },
            data: {
               status: 'paid',
               amountPaid: repayment.amount, // fully clears
               paidDate: new Date(),
            },
         });

         // ---- Compulsory Savings Hook (Phase 3) ----
         // Still credit locked savings matching installment
         await creditLockedSavings(
            tx,
            repayment.userId,
            2000, // standard Bi-daily installment savings amount
            id,
            `Manual reconciliation sweep: ${overrideReason}`
         );

         // ---- Audit Trail (Phase 4.4) ----
         await tx.auditLog.create({
            data: {
               userId: ctx.user.sub,
               action: 'manual_reconcile',
               resource: 'repayment',
               resourceId: id,
               details: `Cleared debt amount ${remainingAmount}. Reason: ${overrideReason}`,
            },
         });

         return uR;
      });

      log.info({ repaymentId: id, user: ctx.user.sub }, 'Repayment manually reconciled');

      return NextResponse.json({
         success: true,
         message: 'Repayment manually reconciled successfully',
         data: updatedRepayment,
      });

    } catch (error) {
       log.error({ error }, 'Manual reconciliation failed');
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
