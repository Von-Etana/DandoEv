/**
 * Prisma 7-compatible type utilities.
 * Use these instead of 'Prisma.TransactionClient' from the removed Prisma namespace.
 */
import prisma from './prisma';

/** Transaction client inferred from Prisma's $transaction method */
export type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
