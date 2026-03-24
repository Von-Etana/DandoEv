import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { postLedgerEntries } from './ledger';
import logger from './logger';

export async function ensureWallet(tx: Prisma.TransactionClient, userId: string) {
  let wallet = await tx.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await tx.wallet.create({ data: { userId } });
  }
  return wallet;
}

/**
 * Debit User Wallet (Main) and Credit Locked Savings Wallet.
 * Increments liability (Locked Savings) and decrements liability (Main Wallet).
 */
export async function lockSavings(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reference: string,
  details?: string
) {
  const wallet = await ensureWallet(tx, userId);

  if (Number(wallet.mainBalance) < amount) {
    throw new Error('Insufficient funds in main wallet');
  }

  // Update balances
  await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      mainBalance: { decrement: amount },
      lockedSaving: { increment: amount },
    },
  });

  // Post ledger logs
  const groupId = crypto.randomUUID();
  await postLedgerEntries(tx, [
    {
      account: `wallet_main:${userId}`,
      debit: amount,
      credit: 0,
      reference,
      details: details || 'Lock savings',
    },
    {
      account: `wallet_locked:${userId}`,
      debit: 0,
      credit: amount,
      reference,
      details: details || 'Lock savings',
    },
  ], groupId);

  return groupId;
}

/**
 * Refund from Locked Savings to Main Wallet
 */
export async function unlockSavings(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reference: string,
  details?: string
) {
  const wallet = await ensureWallet(tx, userId);

  if (Number(wallet.lockedSaving) < amount) {
    throw new Error('Insufficient locked funds');
  }

  await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      mainBalance: { increment: amount },
      lockedSaving: { decrement: amount },
    },
  });

  const groupId = crypto.randomUUID();
  await postLedgerEntries(tx, [
    {
      account: `wallet_locked:${userId}`,
      debit: amount,
      credit: 0,
      reference,
      details: details || 'Unlock savings',
    },
    {
      account: `wallet_main:${userId}`,
      debit: 0,
      credit: amount,
      reference,
      details: details || 'Unlock savings',
    },
  ], groupId);

  return groupId;
}

/**
 * Credit Locked Savings independently (e.g., from card payment split)
 */
export async function creditLockedSavings(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reference: string,
  details?: string
) {
  const wallet = await ensureWallet(tx, userId);

  await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      lockedSaving: { increment: amount },
    },
  });

  const groupId = crypto.randomUUID();
  await postLedgerEntries(tx, [
    {
      account: `platform_source:${userId}`, // Represent source
      debit: amount,
      credit: 0,
      reference,
      details: details || 'External savings match',
    },
    {
      account: `wallet_locked:${userId}`,
      debit: 0,
      credit: amount,
      reference,
      details: details || 'Compulsory savings allocation',
    },
  ], groupId);

  return groupId;
}
