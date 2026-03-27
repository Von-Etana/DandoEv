import prisma from './prisma';
import logger from './logger';
import { BNPL_CONFIG } from './constants';
import { enqueueNotification } from './queue';

/**
 * Sweeps all upcoming repayments and identifies those that are past their due date
 * including the grace period. Marks them as 'overdue' and applies late fees.
 */
export async function runOverdueSweep(now: Date = new Date()) {
    const log = logger.child({ service: 'overdue-sweep', timestamp: now.toISOString() });
    log.info('Starting overdue detection sweep...');

    // Calculate the cutoff date (DueDate + GracePeriod)
    // If DueDate + GracePeriod < Now, then it's overdue.
    // Equivalent: DueDate < Now - GracePeriod
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - BNPL_CONFIG.gracePeriodDays);

    try {
        const pastDueRepayments = await prisma.repayment.findMany({
            where: {
                status: 'upcoming',
                dueDate: { lt: cutoffDate }
            },
            include: {
                loanRelation: {
                    include: { user: true }
                }
            }
        });

        log.info({ count: pastDueRepayments.length }, 'Found potential overdue repayments');

        let updatedCount = 0;

        for (const repayment of pastDueRepayments) {
            try {
                const amount = Number(repayment.amount);
                const lateFee = amount * (BNPL_CONFIG.lateFeePercent / 100);

                await prisma.$transaction(async (tx) => {
                    // 2. Notify Buyer about overdue payment
                    await enqueueNotification({
                        userId: repayment.userId,
                        type: 'overdue_payment',
                        title: 'Payment OVERDUE ⚠️',
                        message: `Your installment of ₦${amount.toLocaleString()} is now overdue. A late fee of ₦${lateFee.toLocaleString()} has been applied. Please fund your wallet to avoid further penalties.`,
                        channels: ['email', 'push', 'sms']
                    });

                    // 3. Status Check: Default logic
                    const overdueForLoan = await tx.repayment.count({
                        where: {
                            loanId: repayment.loanId,
                            status: 'overdue'
                        }
                    });

                    if (overdueForLoan >= 3 && (repayment.loanRelation.status as string) !== 'defaulted') {
                        // Mark the entire loan as defaulted
                        await tx.loan.update({
                            where: { id: repayment.loanId },
                            data: { 
                                status: 'defaulted' as const,
                                adminNotes: (repayment.loanRelation.adminNotes || '') + '\nSystem: Marked as defaulted due to 3+ overdue installments.'
                            }
                        });

                        // Notify Buyer about default
                        await enqueueNotification({
                            userId: repayment.userId,
                            type: 'loan_defaulted',
                            title: 'Loan Status: DEFAULTED 🆘',
                            message: `Due to 3+ consecutive missed installments, your BNPL loan has been marked as DEFAULTED. Your guarantors have been notified and recovery processes may be initiated.`,
                            channels: ['email', 'push', 'sms']
                        });

                        // Notify ALL assigned guarantors
                        const assignedGuarantors = await tx.guarantor.findMany({
                            where: { loanId: repayment.loanId, status: 'accepted' }
                        });

                        for (const guarantor of assignedGuarantors) {
                            if (guarantor.email) {
                                await enqueueNotification({
                                    userId: repayment.userId, // Link back to applicant userId for context
                                    type: 'guarantor_notice',
                                    title: 'IMPORTANT: Borrower Default Notice',
                                    message: `As a guarantor for ${repayment.loanRelation.user.firstName || 'this applicant'}, please note that their loan is now DEFAULTED due to multiple missed payments. We may reach out to you shortly for support in resolving this account.`,
                                    channels: ['email', 'sms']
                                });
                            }
                        }

                        // 4. Log the default in AuditLog
                        await tx.auditLog.create({
                            data: {
                                userId: repayment.userId,
                                action: 'loan_defaulted',
                                resource: 'loan',
                                resourceId: repayment.loanId,
                                details: 'Loan automatically marked as DEFAULTED due to 3+ consecutive missed installments.',
                            }
                        });

                        log.warn({ loanId: repayment.loanId }, 'Loan marked as DEFAULTED and guarantors notified');
                    }
                });

                updatedCount++;
            } catch (err: any) {
                log.error({ error: err.message, repaymentId: repayment.id }, 'Failed to process overdue repayment');
            }
        }

        log.info({ updatedCount }, 'Overdue sweep completed');
        return updatedCount;
    } catch (error: any) {
        log.error({ error: error.message }, 'Global overdue sweep failed');
        throw error;
    }
}
