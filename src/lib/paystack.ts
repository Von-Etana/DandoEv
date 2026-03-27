// ============================================================
// Paystack – Payments & Recurring Direct Debits
// Docs: https://paystack.com/docs/api
// ============================================================
import logger from './logger';

const PAYSTACK_API_BASE = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

// ---- Shared fetch helper ----
async function paystackFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      ...(options.headers || {}),
    },
  });

  const body = await res.json() as { status: boolean; message: string; data: T };

  if (!body.status) {
    throw new Error(`Paystack error: ${body.message}`);
  }

  return body.data;
}

// ---- Types ----
export interface PaystackAuthorization {
  authorization_code: string;
  card_type: string;
  last4: string;
  bank: string;
  reusable: boolean;
}

export interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  status: string;
  authorization: PaystackAuthorization;
  customer: {
    customer_code: string;
    email: string;
  };
}

/**
 * Verify a transaction and extract the authorization for future recurring charges.
 */
export async function verifyPaystackTransaction(reference: string): Promise<PaystackTransaction> {
  logger.info({ reference }, 'Verifying Paystack transaction');
  return paystackFetch<PaystackTransaction>(`/transaction/verify/${reference}`);
}

/**
 * Create a Paystack Customer record to associate with a user.
 */
export async function createPaystackCustomer(data: {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<{ customer_code: string; id: number }> {
  logger.info({ email: data.email }, 'Creating Paystack customer');
  return paystackFetch('/customer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Initialize a standard Paystack payment link (for first-time card linking or one-off payments).
 */
export async function initializePaystackTransaction(data: {
  email: string;
  amount: number; // in kobo (NGN * 100)
  reference?: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}): Promise<{ authorization_url: string; access_code: string; reference: string }> {
  logger.info({ email: data.email, amount: data.amount }, 'Initializing Paystack transaction');
  return paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Charge a previously saved card using its authorization_code.
 * Used for automated bi-daily loan repayments (direct debit).
 */
export async function chargePaystackAuthorization(data: {
  authorization_code: string;
  email: string;
  amount: number; // in kobo
  reference?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ reference: string; status: string; amount: number }> {
  logger.info({ email: data.email, amount: data.amount }, 'Charging Paystack authorization (direct debit)');
  return paystackFetch('/transaction/charge_authorization', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      reference: data.reference || `DDBT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }),
  });
}
