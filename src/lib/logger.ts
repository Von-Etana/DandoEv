// ============================================================
// Structured Logger (Pino)
// ============================================================
import pino from 'pino';

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
});

/**
 * Create a child logger with request context
 */
export function createRequestLogger(requestId: string, path: string) {
  return logger.child({ requestId, path });
}

export default logger;
