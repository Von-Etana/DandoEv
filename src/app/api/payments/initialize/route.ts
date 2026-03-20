import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withValidation, withIdempotency, type ApiContext } from '@/lib/api-handler';
import { initializePaymentSchema, type InitializePaymentInput } from '@/lib/schemas';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * POST /api/payments/initialize
 * Initialize a payment with Paystack and return the authorization URL.
 */
export const POST = withAuth(
  withIdempotency(
    withValidation(
      initializePaymentSchema,
      async (req: NextRequest, ctx: ApiContext & { validatedBody: InitializePaymentInput }) => {
        const log = logger.child({ requestId: ctx.requestId, route: 'payments/initialize' });
        const { amount, orderId, loanId, repaymentId, callbackUrl, metadata } = ctx.validatedBody;

        try {
          // ---- Create local transaction record ----
          const transaction = await prisma.paymentTransaction.create({
            data: {
              userId: ctx.user.sub,
              orderId: orderId || null,
              loanId: loanId || null,
              repaymentId: repaymentId || null,
              provider: 'paystack',
              amount,
              currency: 'NGN',
              status: 'initiated',
              idempotencyKey: req.headers.get('idempotency-key') || null,
              metadata: metadata as object || {},
            },
          });

          // ---- Call Paystack Initialize ----
          const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: ctx.user.email,
              amount: Math.round(amount * 100), // Paystack uses kobo (1 NGN = 100 kobo)
              reference: transaction.id,
              callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/callback`,
              metadata: {
                transaction_id: transaction.id,
                user_id: ctx.user.sub,
                order_id: orderId,
                loan_id: loanId,
                ...metadata,
              },
            }),
          });

          const paystackData = await paystackResponse.json();

          if (!paystackData.status) {
            log.error({ paystackData }, 'Paystack initialization failed');
            await prisma.paymentTransaction.update({
              where: { id: transaction.id },
              data: { status: 'failed' },
            });
            return NextResponse.json(
              { error: 'Payment initialization failed', details: paystackData.message },
              { status: 502 }
            );
          }

          // ---- Update transaction with Paystack reference ----
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              providerRef: paystackData.data.reference,
              status: 'pending',
            },
          });

          log.info({ transactionId: transaction.id }, 'Payment initialized');

          return NextResponse.json({
            success: true,
            data: {
              authorizationUrl: paystackData.data.authorization_url,
              accessCode: paystackData.data.access_code,
              reference: paystackData.data.reference,
              transactionId: transaction.id,
            },
          });
        } catch (error) {
          log.error({ error }, 'Payment initialization error');
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
      }
    )
  )
);
