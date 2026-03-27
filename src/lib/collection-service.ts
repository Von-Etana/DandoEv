import prisma from './prisma';
import logger from './logger';
import { lockSavings } from './wallet';
import { Prisma } from '@prisma/client';
import { chargePaystackAuthorization } from './paystack';

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
                const wallet = record.user.wallet;
                const walletBalance = wallet ? Number(wallet.mainBalance) : 0;
                const amount = Number(record.amount);

                // --- Path 1: Sufficient wallet balance ---
                if (walletBalance >= amount) {
                    await prisma.$transaction(async (tx) => {
                        await lockSavings(tx, record.userId, amount, `SAV-${record.id}`, `Daily Savings: ${record.date.toISOString().split('T')[0]}`);
                        await tx.dailySaving.update({
                            where: { id: record.id },
                            data: { status: 'collected', paymentRef: `WALLET-AUTO-${record.id}` }
                        });
                    });
                    collectedCount++;
                } else {
                    // --- Path 2: Try Paystack direct debit (card on file) ---
                    const userWithCard = await (prisma.user as any).findUnique({ 
                        where: { id: record.userId }, 
                        select: { email: true, paystackAuthCode: true } 
                    }) as any;

                    if (userWithCard?.paystackAuthCode) {
                        try {
                            const charge = await chargePaystackAuthorization({
                                authorization_code: userWithCard.paystackAuthCode,
                                email: userWithCard.email,
                                amount: amount * 100, // Paystack uses kobo
                                reference: `SAV-PSK-${record.id}`,
                                metadata: { saving_record_id: record.id, type: 'daily_savings' }
                            });

                            if (charge.status === 'success') {
                                // Paystack charged — credit the locked savings wallet
                                await prisma.$transaction(async (tx) => {
                                    await lockSavings(tx, record.userId, amount, charge.reference, `Daily Savings (Paystack): ${record.date.toISOString().split('T')[0]}`);
                                    await tx.dailySaving.update({
                                        where: { id: record.id },
                                        data: { status: 'collected', paymentRef: charge.reference }
                                    });
                                });
                                collectedCount++;
                                log.info({ userId: record.userId, reference: charge.reference }, 'Daily saving collected via Paystack direct debit');
                            } else {
                                throw new Error(`Charge status: ${charge.status}`);
                            }
                        } catch (chargeErr: any) {
                            log.warn({ userId: record.userId, error: chargeErr.message }, 'Paystack direct debit failed — marking as missed');
                            await prisma.dailySaving.update({ where: { id: record.id }, data: { status: 'missed' } });
                            missedCount++;
                        }
                    } else {
                        // --- Path 3: No card on file — mark as missed ---
                        await prisma.dailySaving.update({ where: { id: record.id }, data: { status: 'missed' } });
                        missedCount++;
                        log.warn({ userId: record.userId }, 'No card on file and insufficient wallet balance — saving missed');
                    }
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
