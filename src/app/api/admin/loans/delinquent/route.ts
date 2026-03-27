import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * GET /api/admin/loans/delinquent
 * Returns all 'overdue' repayments with their details.
 */
export const GET = withRoles(
  ['super_admin', 'finance_admin', 'compliance_officer'],
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const overdueRepayments = await prisma.repayment.findMany({
        where: { status: 'overdue' },
        include: {
          loanRelation: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
              bike: { select: { id: true, name: true, brand: true } },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      // Calculate total at-risk amount
      const totalAtRisk = overdueRepayments.reduce(
        (acc: number, r: any) => acc + Number(r.amount) - Number(r.amountPaid),
        0
      );

      return NextResponse.json({
        success: true,
        data: {
          count: overdueRepayments.length,
          totalAtRisk,
          repayments: overdueRepayments.map((r: any) => ({
             repaymentId: r.id,
             amount: Number(r.amount),
             amountPaid: Number(r.amountPaid),
             dueDate: r.dueDate,
             daysOverdue: Math.floor((Date.now() - new Date(r.dueDate).getTime()) / (1000 * 3600 * 24)),
             loanId: r.loanId,
             user: r.loanRelation.user,
             bike: r.loanRelation.bike,
          })),
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch delinquent loans');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
