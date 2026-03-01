/**
 * Simple structured logger — use in place of console for requestId/user context later.
 */

const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const levels: Record<string, number> = { error: 0, warn: 1, info: 2, debug: 3 };

function log(level: string, message: string, meta?: Record<string, unknown>) {
  if (levels[level] > (levels[LOG_LEVEL] ?? 2)) return;
  const payload = { timestamp: new Date().toISOString(), level, message, ...meta };
  const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (process.env.NODE_ENV === 'production') {
    out(JSON.stringify(payload));
  } else {
    out(`${payload.timestamp} [${level}] ${message}`, meta ?? '');
  }
}

export const logger = {
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};
