import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { setConfig } from './config.js';
import notifyRouter from './routes/notify.js';
import ordersRouter from './routes/orders.js';
import webhooksRouter from './routes/webhooks.js';
import { closeDb, initDb } from './db.js';
import { initEmail } from './lib/email.js';
import { logger } from './lib/logger.js';
import { requestLog } from './middleware/requestLog.js';
import { healthLimiter } from './middleware/rateLimit.js';

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  PORT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 4000))
    .pipe(z.number().int().positive().max(65535)),
  CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('OneCreations <hello@onecreations.in>'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

const envResult = EnvSchema.safeParse(process.env);
if (!envResult.success) {
  const issues = envResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  logger.fatal({ issues }, 'startup.invalid_env');
  process.exit(1);
}
const env = envResult.data;

const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Razorpay is "all or nothing" on the pair — a lone key id without a secret
// (or vice versa) is a misconfiguration; refuse to half-enable payments.
const razorpayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
if ((env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_SECRET) && !razorpayConfigured) {
  logger.fatal('startup.razorpay_partial_config');
  process.exit(1);
}

setConfig({
  port: env.PORT,
  corsOrigins,
  mongoUri: env.MONGODB_URI,
  email: { from: env.EMAIL_FROM, apiKey: env.RESEND_API_KEY },
  razorpay: razorpayConfigured
    ? {
        keyId: env.RAZORPAY_KEY_ID!,
        keySecret: env.RAZORPAY_KEY_SECRET!,
        webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
      }
    : null,
});

const app = express();

// nginx on the droplet terminates TLS and forwards X-Forwarded-For.
// Trusting one hop lets express-rate-limit see the real client IP.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(requestLog);

// IMPORTANT: webhooks router consumes the raw body (express.raw inside the
// router) for HMAC verification. It MUST be mounted before express.json().
app.use('/webhooks', webhooksRouter);

app.use(express.json({ limit: '8kb' }));

app.get('/health', healthLimiter, (_req, res) => {
  res.json({ ok: true });
});
app.use('/notify', notifyRouter);
app.use('/orders', ordersRouter);

app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  (req.log ?? logger).error({ err, status }, 'request_failed');
  res.status(status).json({ ok: false, error: status >= 500 ? 'internal' : 'bad_request' });
});

async function main() {
  try {
    await initDb(env.MONGODB_URI);
  } catch (err) {
    logger.fatal({ err }, 'startup.db_init_failed');
    process.exit(1);
  }

  initEmail(env.RESEND_API_KEY, env.EMAIL_FROM);

  logger.info(
    {
      payments: razorpayConfigured ? 'enabled' : 'disabled',
      webhook: env.RAZORPAY_WEBHOOK_SECRET ? 'enabled' : 'disabled',
    },
    'startup.features',
  );

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'startup.listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'shutdown.begin');
    server.close(async (err) => {
      if (err) logger.error({ err }, 'shutdown.server_close_error');
      try {
        await closeDb();
      } catch (e) {
        logger.error({ err: e }, 'shutdown.db_close_error');
      }
      process.exit(err ? 1 : 0);
    });
    // Hard-exit backstop.
    setTimeout(() => {
      logger.error('shutdown.timeout_force_exit');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void main();
