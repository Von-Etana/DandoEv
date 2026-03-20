import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackSignature, deduplicateWebhookEvent, updateWebhookEventStatus, PAYSTACK_EVENTS } from '@/lib/webhook';
import { enqueuePaymentJob } from '@/lib/queue';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * POST /api/webhooks/paystack
 * Handles incoming Paystack webhook events.
 *
 * Flow:
 * 1. Verify HMAC-SHA512 signature
 * 2. Deduplicate by event ID
 * 3. Enqueue to BullMQ for async processing
 * 4. Return 200 immediately (Paystack requires < 5s response)
 */
export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'webhooks/paystack' });

  try {
    // ---- Read raw body for signature verification ----
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      log.warn('Missing x-paystack-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // ---- Verify Signature ----
    if (!verifyPaystackSignature(rawBody, signature)) {
      log.warn('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // ---- Parse Event ----
    let event: { event: string; data: Record<string, unknown> };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventId = `${event.event}:${(event.data.reference as string) || (event.data.id as string) || Date.now()}`;

    log.info({ eventType: event.event, eventId }, 'Webhook received');

    // ---- Deduplicate ----
    const isDuplicate = await deduplicateWebhookEvent(
      'paystack',
      eventId,
      event.event,
      event.data
    );

    if (isDuplicate) {
      return NextResponse.json({ received: true });
    }

    // ---- Route by Event Type ----
    switch (event.event) {
      case PAYSTACK_EVENTS.CHARGE_SUCCESS:
      case PAYSTACK_EVENTS.TRANSFER_SUCCESS:
      case PAYSTACK_EVENTS.TRANSFER_FAILED:
      case PAYSTACK_EVENTS.REFUND_PROCESSED: {
        // Enqueue for async processing
        await enqueuePaymentJob({
          eventId,
          eventType: event.event,
          payload: event.data,
        });
        break;
      }

      default:
        log.info({ eventType: event.event }, 'Unhandled webhook event type — logged');
    }

    // ---- Return 200 immediately ----
    return NextResponse.json({ received: true });
  } catch (error) {
    log.error({ error }, 'Webhook processing error');
    // Still return 200 to prevent Paystack from retrying
    return NextResponse.json({ received: true });
  }
}
