import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * GET /api/admin/audit-logs — System activity feed
 */
export const GET = withRoles(
  ['super_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          ...(userId && { userId }),
          ...(action && { action: { contains: action, mode: 'insensitive' } }),
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({ success: true, data: logs });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch audit logs');
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
  }
);
