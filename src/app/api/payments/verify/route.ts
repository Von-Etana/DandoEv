import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * GET /api/payments/verify?reference=xxx
 * Verify a payment transaction against Paystack and update local records.
 */
export const GET = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    const log = logger.child({ requestId: ctx.requestId, route: 'payments/verify' });
    const reference = new URL(req.url).searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    try {
      // ---- Verify with Paystack ----
      const paystackResponse = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const paystackData = await paystackResponse.json();

      if (!paystackData.status) {
        return NextResponse.json(
          { error: 'Verification failed', details: paystackData.message },
          { status: 400 }
        );
      }

      const txData = paystackData.data;

      // ---- Update local transaction ----
      const transaction = await prisma.paymentTransaction.findFirst({
        where: {
          OR: [
            { providerRef: reference },
            { id: reference },
          ],
        },
      });

      if (transaction) {
        const newStatus = txData.status === 'success' ? 'success' : 'failed';
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: newStatus },
        });

        // If successful and linked to an order, update order status
        if (newStatus === 'success' && transaction.orderId) {
          await prisma.order.update({
            where: { id: transaction.orderId },
            data: { status: 'confirmed' },
          });
        }
      }

      log.info({ reference, status: txData.status }, 'Payment verified');

      return NextResponse.json({
        success: true,
        data: {
          status: txData.status,
          amount: txData.amount / 100, // Convert from kobo to Naira
          currency: txData.currency,
          reference: txData.reference,
          paidAt: txData.paid_at,
          channel: txData.channel,
        },
      });
    } catch (error) {
      log.error({ error, reference }, 'Payment verification error');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
