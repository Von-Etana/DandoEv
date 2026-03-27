import { supabaseAdmin } from './supabase';
import logger from './logger';

/**
 * Broadcasts a real-time notification to a specific user's channel.
 * This is used for 'instant' feedback in the app (e.g., payment success, overdue alerts).
 */
export async function broadcastNotification(payload: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
}) {
    const channelName = `notifications:user:${payload.userId}`;
    const log = logger.child({ channel: channelName, type: payload.type });

    try {
        const response = await supabaseAdmin
            .channel(channelName)
            .send({
                type: 'broadcast',
                event: 'new_notification',
                payload: {
                    id: crypto.randomUUID(),
                    ...payload,
                    timestamp: new Date().toISOString()
                }
            });

        if (response !== 'ok' && response !== 'error') {
            log.info({ response }, 'Real-time broadcast result');
        } else if (response === 'error') {
            log.error('Real-time broadcast failed with error response');
        }
    } catch (err: any) {
        log.error({ error: err.message }, 'Unexpected error during realtime broadcast');
    }
}
