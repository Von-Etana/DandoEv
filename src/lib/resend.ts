import logger from './logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@dandoev.com';

/**
 * Send an email using Resend API.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    logger.warn({ to, subject }, 'Resend API key missing, skipping email');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `DandoEv <${RESEND_FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Resend');
    }

    logger.info({ to, subject, resendId: data.id }, 'Email sent successfully via Resend');
    return data;
  } catch (error: any) {
    logger.error({ to, error: error.message }, 'Resend email dispatch failed');
    throw error;
  }
}
