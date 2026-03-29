import prisma from './prisma';
import logger from './logger';
import { lockSavings, debitWalletForRepayment } from './wallet';
import { chargePaystackAuthorization } from './paystack';
import { enqueueNotification } from './queue';

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

/**
 * Sweeps due BNPL Repayments and attempts auto-collection from wallet or linked card.
 */
export async function runRepaymentCollectionSweep(targetDate: Date = new Date()) {
    const log = logger.child({ service: 'repayment-sweep', date: targetDate.toISOString().split('T')[0] });
    log.info('Starting BNPL repayment collection sweep...');

    const endOfToday = new Date(targetDate);
    endOfToday.setHours(23, 59, 59, 999);

    try {
        // Find due repayments (upcoming and due today, or failed and needing retry)
        const dueRepayments = await prisma.repayment.findMany({
            where: {
                status: { in: ['upcoming', 'failed'] },
                dueDate: { lte: endOfToday },
                retryCount: { lt: 3 }
            },
            include: {
                loanRelation: {
                    include: { user: { include: { wallet: true } } }
                }
            }
        });

        log.info({ count: dueRepayments.length }, 'Found due repayments for collection');

        let successCount = 0;
        let failCount = 0;

        for (const repayment of dueRepayments) {
            try {
                const result = await collectRepaymentById(repayment);
                if (result.success) successCount++;
                else failCount++;
            } catch (err: any) {
                log.error({ error: err.message, repaymentId: repayment.id }, 'Repayment sweep loop failed');
                failCount++;
            }
        }

        log.info({ successCount, failCount }, 'Repayment collection sweep completed');
        return { successCount, failCount };
    } catch (error: any) {
        log.error({ error: error.message }, 'Global repayment sweep failed');
        throw error;
    }
}

/**
 * Attempts to collect a single repayment using wallet or card.
 */
export async function collectRepaymentById(repayment: any) {
    const user = repayment.loanRelation.user;
    const amount = Number(repayment.amount) + Number(repayment.lateFee);

    try {
        // --- Try Wallet Debit ---
        const walletBalance = user.wallet ? Number(user.wallet.mainBalance) : 0;
        if (walletBalance >= amount) {
            await prisma.$transaction(async (tx) => {
                await debitWalletForRepayment(tx, user.id, amount, repayment.id, `Loan Repayment #${repayment.installmentNumber} (Wallet)`);
                await tx.repayment.update({
                    where: { id: repayment.id },
                    data: { status: 'paid', paidDate: new Date(), amountPaid: amount }
                });
            });
            await enqueueNotification({
                userId: user.id,
                type: 'payment_success',
                title: 'Loan Repayment Successful',
                message: `Your installment #${repayment.installmentNumber} of ${amount} was successfully debited from your wallet.`,
                channels: ['email', 'whatsapp']
            });
            return { success: true, method: 'wallet' };
        }

        // --- Try Paystack Charge ---
        if (user.paystackAuthCode) {
            try {
                const charge = await chargePaystackAuthorization({
                    authorization_code: user.paystackAuthCode,
                    email: user.email,
                    amount: amount * 100,
                    reference: `RPY-${repayment.id}-${Date.now()}`,
                    metadata: { repayment_id: repayment.id, type: 'loan_repayment' }
                });

                if (charge.status === 'success') {
                    await prisma.$transaction(async (tx) => {
                        await tx.repayment.update({
                            where: { id: repayment.id },
                            data: { status: 'paid', paidDate: new Date(), amountPaid: amount, paymentReference: charge.reference }
                        });
                    });
                    await enqueueNotification({
                        userId: user.id,
                        type: 'payment_success',
                        title: 'Loan Repayment Successful',
                        message: `Your installment #${repayment.installmentNumber} of ${amount} was successfully charged to your card.`,
                        channels: ['email', 'whatsapp']
                    });
                    return { success: true, method: 'card' };
                } else {
                    throw new Error(`Charge failed with status: ${charge.status}`);
                }
            } catch (chargeErr: any) {
                logger.warn({ userId: user.id, error: chargeErr.message }, 'Paystack auto-charge failed');
            }
        }

        // --- Final Failure Handling ---
        const newRetryCount = repayment.retryCount + 1;
        const newStatus = newRetryCount >= 3 ? 'overdue' : 'failed';

        await prisma.repayment.update({
            where: { id: repayment.id },
            data: { status: newStatus as any, retryCount: newRetryCount }
        });

        await enqueueNotification({
            userId: user.id,
            type: 'payment_failed',
            title: 'Action Required: Loan Repayment Failed',
            message: `We were unable to collect your installment of ${amount}. Please fund your wallet or update your card to avoid late fees.`,
            channels: ['email', 'whatsapp', 'sms']
        });

        return { success: false, status: newStatus };

    } catch (err: any) {
        logger.error({ error: err.message, repaymentId: repayment.id }, 'Single repayment collection failed');
        throw err;
    }
}
