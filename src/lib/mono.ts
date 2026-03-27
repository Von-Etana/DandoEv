// ============================================================
// Mono – KYC Identity & Bank Statement Integration
// Docs: https://docs.mono.co
// ============================================================
import logger from './logger';

const MONO_API_BASE = 'https://api.withmono.com/v2';
const MONO_SECRET_KEY = process.env.MONO_SECRET_KEY || '';

// ---- Shared fetch helper ----
async function monoFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${MONO_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'mono-sec-key': MONO_SECRET_KEY,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mono API error [${res.status}]: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ---- Types ----
export interface MonoIdentity {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  bvn?: string;
  addressLine1?: string;
  addressLine2?: string;
}

export interface MonoTransaction {
  id: string;
  amount: number;
  date: string;
  narration: string;
  type: 'debit' | 'credit';
  balance: number;
}

export interface MonoStatementSummary {
  averageMonthlyDebit: number;
  averageMonthlyCredit: number;
  totalDebits: number;
  totalCredits: number;
  monthsAnalysed: number;
  transactions: MonoTransaction[];
}

/**
 * Step 1: Exchange a public auth-code (from Mono Connect widget) for an account_id.
 * Called after the user completes the Connect flow on the frontend.
 */
export async function exchangeMonoToken(code: string): Promise<{ id: string }> {
  logger.info({ code }, 'Exchanging Mono public token');
  return monoFetch('/accounts/auth', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

/**
 * Step 2: Retrieve the identity/KYC data for a linked account.
 */
export async function getMonoIdentity(accountId: string): Promise<MonoIdentity> {
  logger.info({ accountId }, 'Fetching Mono identity');
  const res = await monoFetch<{ data: MonoIdentity }>(`/accounts/${accountId}/identity`);
  return res.data;
}

/**
 * Step 3: Retrieve a 6-month bank statement summary for credit decisioning.
 */
export async function getMonoStatement(
  accountId: string,
  months: number = 6
): Promise<MonoStatementSummary> {
  logger.info({ accountId, months }, 'Fetching Mono bank statement');

  const period = `last${months}months`;
  const res = await monoFetch<{ data: MonoTransaction[] }>(
    `/accounts/${accountId}/transactions?period=${period}&paginate=false`
  );

  const txns = res.data;
  const debits = txns.filter((t) => t.type === 'debit');
  const credits = txns.filter((t) => t.type === 'credit');

  const totalDebits = debits.reduce((s, t) => s + t.amount, 0);
  const totalCredits = credits.reduce((s, t) => s + t.amount, 0);

  return {
    averageMonthlyDebit: totalDebits / months,
    averageMonthlyCredit: totalCredits / months,
    totalDebits,
    totalCredits,
    monthsAnalysed: months,
    transactions: txns,
  };
}

/**
 * Verify a Mono webhook signature.
 */
export function verifyMonoSignature(rawBody: string, signatureHeader: string): boolean {
  const crypto = require('crypto');
  const secret = process.env.MONO_WEBHOOK_SECRET || '';
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
