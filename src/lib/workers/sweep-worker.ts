import { runDailySavingsSweep } from '../collection-service';
import { runOverdueSweep } from '../overdue-service';
import { runRepaymentReminders } from '../reminder-service';
import logger from '../logger';

/**
 * Main background worker to perform daily operational sweeps.
 * In a production environment, this could be triggered by:
 * 1. A Kubernetes CronJob
 * 2. A Cloud Scheduler hitting a protected endpoint
 * 3. A persistent worker with node-cron
 */
export async function performDailyOps() {
    const log = logger.child({ worker: 'daily-ops' });
    const now = new Date();
    log.info('Starting daily operations sweep collection...');

    try {
        // 1. Collect daily savings from user wallets
        const savingsResult = await runDailySavingsSweep(now);
        log.info(savingsResult, 'Daily savings sweep finished');

        // 2. Detect overdue payments and apply fees
        const overdueCount = await runOverdueSweep(now);
        log.info({ overdueCount }, 'Overdue detection sweep finished');

        // 3. Send reminders for tomorrow's payments
        const reminderCount = await runRepaymentReminders();
        log.info({ reminderCount }, 'Repayment reminders sent');

        log.info('Daily operations sweep completed successfully');
    } catch (error: any) {
        log.error({ error: error.message }, 'Daily operations sweep failed');
    }
}
