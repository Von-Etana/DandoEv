import { NextRequest, NextResponse } from 'next/server';
import { deduplicateWebhookEvent } from '@/lib/webhook';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * POST /api/webhooks/kyc
 * Fictional callback endpoint for 3rd-party identity verifications.
 */
export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'webhooks/kyc' });

  try {
    const signature = req.headers.get('x-kyc-signature');
    if (!signature && process.env.NODE_ENV === 'production') {
      log.warn('Missing x-kyc-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const body = await req.json();
    const eventId = `kyc_evt_${body.event_id || Date.now()}`;
    const eventType = body.event_type || 'verification.completed';

    log.info({ eventType, eventId }, 'KYC Webhook received');

    // Deduplicate
    const isDuplicate = await deduplicateWebhookEvent('mock_kyc', eventId, eventType, body);
    if (isDuplicate) {
      return NextResponse.json({ received: true });
    }

    // Processing Result
    if (eventType === 'verification.completed' || eventType === 'identity.verified') {
       const userId = body.user_id;
       const result = body.result; // e.g., 'passed' or 'rejected'
       const sessionId = body.session_id;

       if (!userId) {
          return NextResponse.json({ received: true }); // Ignore quietly mapping loss
       }

       if (result === 'passed') {
          await prisma.$transaction(async (tx) => {
             await tx.user.update({
                where: { id: userId },
                data: { kycStatus: 'verified' },
             });

             await tx.kycDocument.updateMany({
                where: { userId, verificationStatus: 'pending' },
                data: { 
                   verificationStatus: 'verified', 
                   verifiedAt: new Date(), 
                   verifiedBy: 'system-kyc-webhook' 
                },
             });
          });

          log.info({ userId }, 'User KYC successfully verified by tracking');
       } else {
          await prisma.user.update({
             where: { id: userId },
             data: { kycStatus: 'failed' },
          });

          log.info({ userId }, 'User KYC failed verification tracking details');
       }

       await prisma.webhookEvent.update({
          where: { eventId },
          data: { status: 'processed', processedAt: new Date() },
       });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    log.error({ error }, 'KYC Webhook error processing payload');
    return NextResponse.json({ received: true });
  }
}
