import prisma from './prisma';
import logger from './logger';
import { lockSavings } from './wallet';
import { Prisma } from '@prisma/client';

/**
 * Sweeps all pending DailySaving records for a given date (default today).
 * Attempts to auto-debit the user's main wallet.
 */
export async function runDailySavingsSweep(targetDate: Date = new Date()) {
    const log = logger.child({ service: 'daily-savings-sweep', date: targetDate.toISOString().split('T')[0] });
    log.info('Starting daily savings collection sweep...');

    // Normalize date to midnight for comparison
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Find all pending savings for today or before (catch up)
        const pendingSavings = await prisma.dailySaving.findMany({
            where: {
                status: 'pending',
                date: { lte: endOfDay }
            },
            include: {
                user: {
                    include: { wallet: true }
                }
            }
        });

        log.info({ count: pendingSavings.length }, 'Found pending daily savings records');

        let collectedCount = 0;
        let missedCount = 0;

        for (const record of pendingSavings) {
            try {
                // If user has enough balance, collect it
                if (record.user.wallet && Number(record.user.wallet.mainBalance) >= Number(record.amount)) {
                    await prisma.$transaction(async (tx) => {
                        // 1. Debit wallet and credit locked savings
                        await lockSavings(
                            tx,
                            record.userId,
                            Number(record.amount),
                            `SAV-${record.id}`,
                            `Daily Savings Collection: ${record.date.toISOString().split('T')[0]}`
                        );

                        // 2. Mark record as collected
                        await tx.dailySaving.update({
                            where: { id: record.id },
                            data: { 
                                status: 'collected',
                                paymentRef: `WALLET-AUTO-${record.id}`
                            }
                        });
                    });
                    collectedCount++;
                } else {
                    // Mark as missed if balance is low
                    await prisma.dailySaving.update({
                        where: { id: record.id },
                        data: { status: 'missed' }
                    });
                    missedCount++;
                    log.warn({ userId: record.userId, recordId: record.id }, 'Insufficient balance for daily savings collection');
                }
            } catch (err: any) {
                log.error({ error: err.message, recordId: record.id }, 'Failed to process daily saving record');
            }
        }

        log.info({ collectedCount, missedCount }, 'Daily savings sweep completed');
        return { collectedCount, missedCount };
    } catch (error: any) {
        log.error({ error: error.message }, 'Global daily savings sweep failed');
        throw error;
    }
}

/**
 * Catch-up function for missed savings.
 * Can be triggered manually or by a specific job.
 */
export async function retryMissedSavings(userId: string) {
    // Logic to find missed savings and try to collect them if wallet balance has increased
}
