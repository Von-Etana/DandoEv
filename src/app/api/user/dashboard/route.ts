import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * GET /api/user/dashboard
 * Consolidated data for the mobile app landing screen.
 */
export const GET = withAuth(async (req: NextRequest, ctx: ApiContext) => {
  const userId = ctx.user.sub;
  const log = logger.child({ route: 'user/dashboard', userId });

  try {
    const [user, activeLoan, notifications] = await Promise.all([
      // 1. User profile and wallet
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          kycStatus: true,
          customerStatus: true,
          wallet: true,
        },
      }),

      // 2. Active Loan (if any)
      prisma.loan.findFirst({
        where: { userId, status: 'active' },
        include: {
          bike: { select: { name: true, images: true } },
          repayments: {
            where: { status: 'upcoming' },
            orderBy: { dueDate: 'asc' },
            take: 1,
          },
        },
      }),

      // 3. Recent notifications
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate loan progress or other stats
    let loanSummary = null;
    if (activeLoan) {
      const totalPaid = activeLoan.repayments
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + Number(r.amountPaid), 0);
      
      loanSummary = {
        loanId: activeLoan.id,
        bikeName: activeLoan.bike.name,
        bikeImage: activeLoan.bike.images[0],
        totalRepayable: activeLoan.totalRepayable,
        amountPaid: totalPaid,
        progress: (totalPaid / Number(activeLoan.totalRepayable)) * 100,
        nextPayment: activeLoan.repayments[0] || null,
      };
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: `${user.firstName} ${user.lastName}`,
        kycStatus: user.kycStatus,
        customerStatus: user.customerStatus,
        wallet: user.wallet,
      },
      loan: loanSummary,
      notifications,
    });

  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to fetch mobile dashboard data');
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
});
