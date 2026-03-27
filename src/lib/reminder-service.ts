import prisma from './prisma';
import logger from './logger';
import { enqueueNotification } from './queue';

/**
 * Finds upcoming payments due in the next 24 hours and sends reminders.
 */
export async function runRepaymentReminders() {
    const log = logger.child({ service: 'repayment-reminders' });

    // Target: due in next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Start of current day to end of tomorrow
    const now = new Date();
    
    try {
        const upcoming = await prisma.repayment.findMany({
            where: {
                status: 'upcoming',
                dueDate: {
                    gte: now,
                    lte: tomorrow
                }
            },
            include: {
                loan: true, // This is the 'User' relation on Repayment
                loanRelation: true
            }
        });

        log.info({ count: upcoming.length }, 'Found upcoming repayments for reminders');

        for (const repayment of upcoming) {
            await enqueueNotification({
                userId: repayment.userId,
                type: 'repayment_reminder',
                title: 'Upcoming Repayment 💳',
                message: `Friendly reminder: Your bi-daily installment of ₦${Number(repayment.amount).toLocaleString()} is due tomorrow (${repayment.dueDate.toLocaleDateString()}). Please ensure your wallet is funded.`,
                channels: ['push', 'email']
            });
        }

        return upcoming.length;
    } catch (error: any) {
        log.error({ error: error.message }, 'Failed to process reminders');
        throw error;
    }
}
