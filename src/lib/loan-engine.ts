import { calculateInstallment } from './utils';
import { type TxClient } from './prisma-types';


/**
 * Generate a complete repayment schedule and daily savings plan for a loan.
 * Typically called when a loan is approved or moved to 'active' status.
 * 
 * @param tx - Prisma transaction client
 * @param loanId - ID of the loan record
 * @param userId - ID of the borrower
 * @param bikePrice - Original price of the bike
 * @param monthlyRate - Monthly flat interest rate (e.g., 3.5)
 * @param tenureMonths - Tenure in months (e.g., 6)
 */
export async function generateSchedule(
    tx: TxClient,
    loanId: string,
    userId: string,
    bikePrice: number,
    monthlyRate: number,
    tenureMonths: number,
    startDate: Date = new Date()
) {
    const { 
        installmentAmount, 
        numberOfInstallments, 
        totalInterest,
        totalRepayable
    } = calculateInstallment(bikePrice, monthlyRate, tenureMonths);

    // DandoEv standard: 30 days per month
    const totalDays = tenureMonths * 30;
    
    // 1. Generate Daily Savings (₦1,000 every single day)
    // We create many daily records.
    const savingsRecords = [];
    for (let i = 0; i < totalDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        
        savingsRecords.push({
            userId,
            loanId,
            date: d,
            amount: 1000,
            status: 'pending' as const,
        });
    }

    // 2. Generate Bi-daily Repayments (Every 2nd day, installmentAmount)
    const repaymentRecords = [];
    for (let i = 1; i <= numberOfInstallments; i++) {
        const dueDate = new Date(startDate);
        // Step of 2 days
        dueDate.setDate(dueDate.getDate() + (i * 2));
        
        repaymentRecords.push({
            loanId,
            userId,
            installmentNumber: i,
            amount: installmentAmount,
            amountPaid: 0,
            dueDate,
            status: 'upcoming' as const,
        });
    }

    // Batch insertion for performance
    try {
        await tx.dailySaving.createMany({ data: savingsRecords });
        await tx.repayment.createMany({ data: repaymentRecords });
    } catch (error) {
        console.error('Error generating schedule:', error);
        throw error;
    }

    return { totalInstallments: numberOfInstallments, totalDays };
}
