import { NextRequest, NextResponse } from 'next/server';
import { withRoles } from '@/lib/api-handler';
import prisma from '@/lib/prisma';

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'summary';

  try {
    if (type === 'summary') {
      const logs = await prisma.reconciliationLog.findMany({
        orderBy: { startedAt: 'desc' },
        take: 10,
      });
      
      const settlements = await prisma.settlement.findMany({
        orderBy: { payoutDate: 'desc' },
        take: 10,
      });

      return NextResponse.json({ logs, settlements });
    }

    if (type === 'flagged') {
      const flaggedTransactions = await prisma.paymentTransaction.findMany({
        where: {
          status: 'success',
          reconciledAt: null,
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24h but not reconciled
          },
        },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      });

      return NextResponse.json({ flaggedTransactions });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withRoles(['super_admin', 'finance_admin'], handler);
