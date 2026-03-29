import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * GET /api/user/notifications
 * Paginated list of user notifications.
 */
export const GET = withAuth(async (req: NextRequest, ctx: ApiContext) => {
  const userId = ctx.user.sub;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const skip = (page - 1) * limit;

  try {
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    logger.error({ error: error.message, userId }, 'Failed to fetch user notifications');
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
});

/**
 * PATCH /api/user/notifications/mark-read
 * Marks one or all notifications as read.
 */
export const PATCH = withAuth(async (req: NextRequest, ctx: ApiContext) => {
  const userId = ctx.user.sub;

  try {
    const { id, all } = await req.json();

    if (all) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (id) {
        await prisma.notification.update({
            where: { id, userId },
            data: { isRead: true }
        });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    logger.error({ error: error.message, userId }, 'Failed to update notifications');
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
});
