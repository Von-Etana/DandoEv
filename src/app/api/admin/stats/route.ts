import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * GET /api/admin/stats — Dashboard statistics
 * Requires: super_admin or finance_admin role
 */
export const GET = withRoles(
  ['super_admin', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const [
        totalUsers,
        activeLoans,
        pendingApplications,
        totalOrders,
        loansByStatus,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.loan.count({ where: { status: 'active' } }),
        prisma.loan.count({ where: { status: { in: ['pending', 'under_review'] } } }),
        prisma.order.count(),
        prisma.loan.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        prisma.user.findMany({
          select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      // Calculate revenue from successful transactions
      const revenueResult = await prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'success' },
      });

      const totalRevenue = Number(revenueResult._sum.amount || 0);

      // Default rate
      const totalLoans = await prisma.loan.count({ where: { status: { not: 'pending' } } });
      const defaulted = await prisma.loan.count({ where: { status: 'defaulted' } });
      const defaultRate = totalLoans > 0 ? (defaulted / totalLoans) * 100 : 0;

      return NextResponse.json({
        success: true,
        data: {
          totalUsers,
          activeLoans,
          pendingApplications,
          totalOrders,
          totalRevenue,
          defaultRate: Math.round(defaultRate * 100) / 100,
          loansByStatus: loansByStatus.map((l: { status: string; _count: { status: number } }) => ({
            status: l.status,
            count: l._count.status,
          })),
          recentUsers,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch admin stats');
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
  }
);
