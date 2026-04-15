# Plan B7 — Observability (Structured Logging)

Status: **not executed** — no external log shipping in this plan; just pino + pretty-print.

## Context

Current API logging is `console.error` with ad-hoc JSON. That's fine until you need to grep production — at which point you'll wish every line had a consistent shape. Pino is the standard Node structured logger: fast, JSON by default, with an optional `pino-pretty` transport for the dev terminal.

Shipping logs to Axiom/Datadog/BetterStack is explicitly out of scope here — that lives in a future plan once the droplet is live and generating traffic worth storing.

## Prerequisites before executing

- [ ] Plan A already merged (the structured `console.error` JSON in the error handler is what we're formalizing).
- [ ] No external service account needed.

## Steps

### 1. Install

```
cd api && npm install pino
cd api && npm install -D pino-pretty
```

### 2. Logger module

Create `api/src/lib/logger.ts`:

```ts
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: { service: 'onecreations-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'MONGODB_URI'],
    remove: true,
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l', singleLine: true },
      }
    : undefined,
});
```

### 3. Request logging middleware

Create `api/src/middleware/requestLog.ts`:

```ts
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger.js';

declare module 'express-serve-static-core' {
  interface Request { id: string; log: typeof logger }
}

export function requestLog(req: Request, res: Response, next: NextFunction): void {
  req.id = (req.header('x-request-id') ?? randomUUID());
  req.log = logger.child({ reqId: req.id });
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    req.log.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durMs: Math.round(durMs),
      ip: req.ip,
    }, 'http');
  });

  next();
}
```

### 4. Wire into `index.ts`

In [api/src/index.ts](api/src/index.ts):

- Replace the bare `console.log` startup lines with `logger.info(...)`.
- Mount `app.use(requestLog)` right after `helmet` and `cors` (before routes so `req.log` is available).
- Rewrite the error handler to use the logger:

```ts
app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  (req.log ?? logger).error({ err, status }, 'request_failed');
  res.status(status).json({ ok: false, error: status >= 500 ? 'internal' : 'bad_request' });
});
```

- Shutdown logs: `logger.info({ signal }, 'shutdown_begin')` etc.

### 5. Replace ad-hoc `console.error` JSON

Search the api tree for `console.error(JSON.stringify` and `console.log` — replace each call site with `req.log.info/warn/error(...)` (if inside a request) or `logger.*` (startup/shutdown).

Files affected (based on current Plan A state):
- `api/src/index.ts` (startup + shutdown + error handler)
- `api/src/routes/notify.ts` (email-fail log, if Plan B4 has landed)

### 6. Env var for log level

Add to the env schema in `index.ts`:
```ts
LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional(),
```
(Optional; logger already picks it up from `process.env` directly — this just makes the schema honest.)

Update `api/.env.example`:
```
LOG_LEVEL=info
```

### 7. PM2 log integration (deployment note)

`ecosystem.config.cjs` from Plan B3 writes JSON lines (pino default in prod) to `/home/deploy/logs/api.out.log`. Rotate with `pm2 install pm2-logrotate` on the droplet:
```
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

## Files created / modified

- `api/src/lib/logger.ts` (new)
- `api/src/middleware/requestLog.ts` (new)
- `api/src/index.ts` (use logger; mount middleware)
- `api/src/routes/notify.ts` (use `req.log`)
- `api/.env.example` (LOG_LEVEL)
- `api/package.json` (+ pino, +dev pino-pretty)

## Verification

1. `NODE_ENV=development npm run dev` — logs are human-readable, colorized, single line per entry.
2. `NODE_ENV=production node dist/index.js` — logs are one JSON object per line; pipe through `jq` to confirm valid JSON.
3. `curl -H "x-request-id: test-123" localhost:4000/health` → log line contains `"reqId":"test-123"`.
4. POST `/notify` with invalid body → log line has `status:400` and `path:"/notify"`; response body still just `{"ok":false,"error":"bad_request"}` (no leak).
5. `LOG_LEVEL=warn` suppresses `info`-level request logs; errors still appear.
6. Redaction: temporarily log `req.headers` in a handler — `authorization` / `cookie` must appear as stripped. `MONGODB_URI` if accidentally logged must be stripped.

## Follow-ups (not in this plan)

- Ship logs to Axiom / BetterStack / Datadog via a Vector sidecar on the droplet.
- Add OpenTelemetry spans once there's more than one service.
- Uptime probes: UptimeRobot / BetterStack hitting `/health` every minute with Slack alerts.
- Sentry for unhandled exceptions (frontend + backend).
