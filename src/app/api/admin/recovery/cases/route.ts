import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { RecoveryStatus, RecoveryStage } from '@prisma/client';

/**
 * GET /api/admin/recovery/cases
 * List and filter all active recovery cases for collections staff.
 */
export const GET = withRoles(
  ['super_admin', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as RecoveryStatus | null;
    const stage = searchParams.get('stage') as RecoveryStage | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    try {
      const where: any = {};
      if (status) where.status = status;
      if (stage) where.stage = stage;

      const [cases, total] = await Promise.all([
        prisma.recoveryCase.findMany({
          where,
          include: {
            loan: {
              include: { 
                user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                bike: { select: { name: true } }
              }
            },
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { openedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.recoveryCase.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: cases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });

    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to fetch recovery cases');
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
    }
  }
);
