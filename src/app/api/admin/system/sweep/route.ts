import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import { performDailyOps } from '@/lib/workers/sweep-worker';
import logger from '@/lib/logger';

/**
 * POST /api/admin/system/sweep
 * Manually trigger the daily operational sweep.
 * Restricted to super_admin or finance_admin.
 */
export const POST = withRoles(
  ['super_admin', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    const log = logger.child({ requestId: ctx.requestId, route: 'admin/system/sweep' });
    log.info({ initiatedBy: ctx.user.sub }, 'Manual system sweep triggered by admin');

    try {
        // Run the operations (this could be async/queued if it's very large)
        await performDailyOps();

        return NextResponse.json({
            success: true,
            message: 'System sweep (savings, overdue detection, reminders) completed successfully.',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        log.error({ error: error.message }, 'Admin system sweep failed');
        return NextResponse.json({ 
            error: 'Failed to complete system sweep. Check server logs.' 
        }, { status: 500 });
    }
  }
);
