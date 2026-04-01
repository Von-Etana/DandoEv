import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

async function handler(req: NextRequest, ctx: ApiContext) {
  const log = logger.child({ route: 'user/push-token', userId: ctx.user.sub });

  try {
    const { token, platform } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: ctx.user.sub },
      data: {
        pushToken: token,
        pushPlatform: platform || 'expo',
      },
    });

    log.info({ token }, 'Push token updated successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to update push token');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
