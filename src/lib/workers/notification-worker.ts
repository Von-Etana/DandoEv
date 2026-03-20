import { Job } from 'bullmq';
import logger from '../logger';
import prisma from '../prisma';

export async function processNotificationJob(job: Job) {
  const { userId, type, title, message, channels = ['email'] } = job.data as {
    userId: string;
    type: string;
    title: string;
    message: string;
    channels?: ('email' | 'sms' | 'push')[];
  };

  logger.info({ jobId: job.id, userId, type }, 'Processing notification job');

  try {
    // 1. Fetch user to get email/phone
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.error({ userId }, 'User not found for notification');
      throw new Error(`User ${userId} not found`);
    }

    // 2. Dispatch to channels
    for (const channel of channels) {
      switch (channel) {
        case 'email':
          await sendEmail(user.email, title, message);
          break;
        case 'sms':
          if (user.phone) await sendSms(user.phone, message);
          break;
        default:
          logger.warn({ channel }, 'Unsupported notification channel');
      }
    }

    // 3. Save to in-app Notification table
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        createdAt: new Date(),
      },
    });

  } catch (error: any) {
    logger.error({ jobId: job.id, error: error.message }, 'Notification job failed');
    throw error;
  }
}

async function sendEmail(to: string, subject: string, body: string) {
  // Placeholder for Email Service (SendGrid, Mailgun, NodeMailer)
  logger.info({ to, subject }, '📧 [EMAIL SENT] (Mock)');
}

async function sendSms(to: string, message: string) {
  // Placeholder for SMS Service (Twilio, Termii)
  logger.info({ to, message }, '📱 [SMS SENT] (Mock)');
}
