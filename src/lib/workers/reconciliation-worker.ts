import { Job } from 'bullmq';
import prisma from '../prisma';
import logger from '../logger';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/**
 * Reconciliation Worker: Matches provider payouts (settlements) against 
 * internal transaction records to ensure financial integrity.
 */
export async function processReconciliationJob(job: Job) {
  const jobId = job.id || crypto.randomUUID();
  const log = logger.child({ jobId, service: 'reconciliation' });

  // 1. Create Log entry
  const reconLog = await prisma.reconciliationLog.create({
    data: {
      jobId,
      status: 'processing',
    }
  });

  try {
    log.info('Starting reconciliation job');
    let matchedCount = 0;
    let flaggedCount = 0;
    let processedCount = 0;

    // 2. Fetch Recent Settlements from Paystack (Mocking the logic for API call)
    // In production, we'd call https://api.paystack.co/settlement
    const settlements = await fetchPaystackSettlements();

    for (const settlement of settlements) {
      processedCount++;
      
      // Upsert settlement in our DB
      const dbSettlement = await prisma.settlement.upsert({
        where: { providerRef: settlement.id.toString() },
        update: { status: settlement.status },
        create: {
          provider: 'paystack',
          providerRef: settlement.id.toString(),
          amount: settlement.total_amount / 100, // Paystack is in kobo
          payoutDate: new Date(settlement.settlement_date),
          status: settlement.status,
        }
      });

      // 3. Fetch Transactions for this settlement
      // https://api.paystack.co/settlement/:id/transactions
      const providerTxs = await fetchPaystackSettlementTransactions(settlement.id);
      const reconciledTxIds: string[] = [];

      for (const pTx of providerTxs) {
        // Find matching local transaction
        const localTx = await prisma.paymentTransaction.findFirst({
          where: { providerRef: pTx.reference }
        });

        if (localTx) {
          await prisma.paymentTransaction.update({
            where: { id: localTx.id },
            data: { reconciledAt: new Date() }
          });
          reconciledTxIds.push(localTx.id);
          matchedCount++;
        } else {
          log.warn({ providerRef: pTx.reference }, 'Flagged transaction: Found in settlement but not in local DB');
          flaggedCount++;
        }
      }

      // Update settlement with matched transaction IDs
      await prisma.settlement.update({
        where: { id: dbSettlement.id },
        data: { 
          transactionIds: reconciledTxIds,
          processedAt: new Date()
        }
      });
    }

    // 4. Finalize Log
    await prisma.reconciliationLog.update({
      where: { id: reconLog.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalProcessed: processedCount,
        totalMatched: matchedCount,
        totalFlagged: flaggedCount,
      }
    });

    log.info({ matchedCount, flaggedCount }, 'Reconciliation job completed');

  } catch (error: any) {
    log.error({ error: error.message }, 'Reconciliation job failed');
    await prisma.reconciliationLog.update({
      where: { id: reconLog.id },
      data: {
        status: 'failed',
        errors: error.message,
        completedAt: new Date(),
      }
    });
    throw error;
  }
}

/**
 * Mocking Paystack Settlement API calls
 */
async function fetchPaystackSettlements(): Promise<any[]> {
  if (!PAYSTACK_SECRET) return [];
  // return await paystack.settlement.list(...)
  return []; 
}

async function fetchPaystackSettlementTransactions(settlementId: string | number): Promise<any[]> {
  if (!PAYSTACK_SECRET) return [];
  // return await paystack.settlement.transactions(settlementId)
  return [];
}
