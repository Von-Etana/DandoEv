// ============================================================
// Structured Logger (Pino)
// ============================================================
import pino from 'pino';
import * as Sentry from '@sentry/nextjs';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  base: { service: 'dandoev-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label: string) {
      return { level: label };
    },
  },
  hooks: {
    logMethod(inputArgs: any[], method: any) {
      if (method.name === 'error') {
        const [objOrMsg] = inputArgs;
        if (objOrMsg instanceof Error) {
          Sentry.captureException(objOrMsg);
        } else if (objOrMsg && typeof objOrMsg === 'object' && (objOrMsg as any).error instanceof Error) {
          Sentry.captureException((objOrMsg as any).error);
        } else if (typeof objOrMsg === 'string') {
          Sentry.captureMessage(objOrMsg);
        }
      }
      method.apply(this, inputArgs);
    },
  },
});

/**
 * Create a child logger with request context
 */
export function createRequestLogger(requestId: string, path: string) {
  return logger.child({ requestId, path });
}

export default logger;
