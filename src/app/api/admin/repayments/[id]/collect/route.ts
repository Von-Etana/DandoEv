import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import { collectRepaymentById } from '@/lib/collection-service';
import logger from '@/lib/logger';

/**
 * POST /api/admin/repayments/[id]/collect
 * Manually trigger an automated collection for a specific repayment.
 */
export const POST = withRoles(
  ['super_admin', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    const { id } = await ctx.params;

    try {
      const repayment = await prisma.repayment.findUnique({
        where: { id },
        include: {
          loanRelation: {
            include: { user: { include: { wallet: true } } }
          }
        }
      });

      if (!repayment) {
        return NextResponse.json({ error: 'Repayment record not found' }, { status: 404 });
      }

      const result = await collectRepaymentById(repayment);

      return NextResponse.json({
        success: result.success,
        method: (result as any).method,
        status: (result as any).status
      });

    } catch (error: any) {
      logger.error({ error: error.message, repaymentId: id }, 'Manual collection API failed');
      return NextResponse.json({ error: 'Failed to process collection' }, { status: 500 });
    }
  }
);
