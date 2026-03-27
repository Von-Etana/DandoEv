import { NextRequest, NextResponse } from 'next/server';
import { verifyMonoSignature } from '@/lib/mono';
import { deduplicateWebhookEvent } from '@/lib/webhook';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * POST /api/webhooks/mono
 * Handles async events from Mono (e.g. statement ready, account updated).
 */
export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'webhooks/mono' });

  const rawBody = await req.text();
  const signature = req.headers.get('mono-webhook-secret') || '';

  // 1. Verify signature
  if (!verifyMonoSignature(rawBody, signature)) {
    log.warn('Invalid Mono webhook signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let event: { event: string; data: Record<string, any> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventId = `mono_${event.data?.id || Date.now()}`;
  const isDuplicate = await deduplicateWebhookEvent('mono', eventId, event.event, event.data);
  if (isDuplicate) {
    return NextResponse.json({ received: true });
  }

  log.info({ event: event.event, eventId }, 'Processing Mono webhook event');

  try {
    switch (event.event) {
      case 'mono.events.account_updated': {
        const accountId = event.data?.account?._id;
        if (accountId) {
          await (prisma.user as any).updateMany({
            where: { monoAccountId: accountId },
            data: { monoStatus: 'linked' },
          });
          log.info({ accountId }, 'Mono account updated');
        }
        break;
      }

      case 'mono.events.account_connected': {
        // This fires when a user successfully links their bank via Mono Connect
        const accountId = event.data?.account?._id;
        if (accountId) {
          await (prisma.user as any).updateMany({
            where: { monoAccountId: accountId },
            data: { monoStatus: 'linked' },
          });
          log.info({ accountId }, 'Mono account connected');
        }
        break;
      }

      default:
        log.info({ event: event.event }, 'Unhandled Mono event type');
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    log.error({ error: error.message }, 'Mono webhook processing error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
