import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * GET /api/admin/config
 * View global variables
 */
export const GET = withRoles(
  ['super_admin', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const configs = await prisma.systemConfig.findMany();
      // format as dictionary for easy access
      const configMap = configs.reduce((acc: Record<string, string>, c: { key: string; value: string }) => {
        acc[c.key] = c.value;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json({ success: true, data: configMap });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch config');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);

/**
 * POST /api/admin/config
 * Update or set a configuration variable (e.g., Savings_Percentage)
 */
export const POST = withRoles(
  ['super_admin', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const body = await req.json();
      const { key, value } = body;

      if (!key || value === undefined) {
        return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
      }

      const config = await prisma.systemConfig.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });

      // Audit Log (Phase 4.4)
      await prisma.auditLog.create({
        data: {
          userId: ctx.user.sub,
          action: 'update_config',
          resource: 'system_config',
          resourceId: key,
          details: `Updated ${key} to ${value}`,
        },
      });

      return NextResponse.json({ success: true, data: config });
    } catch (error) {
      logger.error({ error }, 'Failed to update config');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
