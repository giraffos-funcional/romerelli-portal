/**
 * Structured logger. Emits single-line JSON for production log ingestion.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown> | Error | unknown;

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function normalize(ctx: LogContext): Record<string, unknown> {
  if (!ctx) return {};
  if (ctx instanceof Error) {
    return { err: ctx.message, stack: ctx.stack };
  }
  if (typeof ctx === 'object') return ctx as Record<string, unknown>;
  return { value: ctx };
}

function emit(level: LogLevel, event: string, ctx: LogContext = {}): void {
  if (!shouldLog(level)) return;
  const payload = { ts: new Date().toISOString(), level, event, ...normalize(ctx) };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);

  if (level === 'error') {
    const sentryDsn = process.env.SENTRY_DSN;
    if (sentryDsn) void forwardToSentry(sentryDsn, event, normalize(ctx));
  }
}

async function forwardToSentry(dsn: string, message: string, ctx: Record<string, unknown>): Promise<void> {
  try {
    const match = /^https:\/\/([^@]+)@([^/]+)\/(\d+)/.exec(dsn);
    if (!match) return;
    const [, publicKey, host, projectId] = match;
    const url = `https://${host}/api/${projectId}/store/`;
    const body = JSON.stringify({
      event_id: crypto.randomUUID().replace(/-/g, ''),
      timestamp: new Date().toISOString(),
      level: 'error',
      platform: 'node',
      logger: 'romerelli-portal',
      message,
      extra: ctx,
    });
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}`,
      },
      body,
    });
  } catch {
    // Never throw from the logger.
  }
}

export const logger = {
  debug: (event: string, ctx?: LogContext) => emit('debug', event, ctx),
  info: (event: string, ctx?: LogContext) => emit('info', event, ctx),
  warn: (event: string, ctx?: LogContext) => emit('warn', event, ctx),
  error: (event: string, ctx?: LogContext) => emit('error', event, ctx),
};
