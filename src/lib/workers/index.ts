import { createWorker, QUEUE_NAMES } from '../queue';
import { processPaymentJob } from './payment-worker';
import { processNotificationJob } from './notification-worker';
import logger from '../logger';

export function startWorkers() {
  if (process.env.NODE_ENV === 'test') {
    logger.info('Skipping worker initialization in test environment');
    return;
  }

  logger.info('Initializing BullMQ Background Workers...');

  // 1. Payment Processing Worker
  createWorker(
    QUEUE_NAMES.PAYMENT_PROCESSING,
    processPaymentJob,
    5 // Concurrency
  );

  // 2. Notification Worker
  createWorker(
    QUEUE_NAMES.NOTIFICATION,
    processNotificationJob,
    10 // Concurrency
  );

  logger.info('All Workers started and listening to queues.');
}
