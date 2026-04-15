import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import notifyRouter from './routes/notify.js';
import { closeDb, initDb } from './db.js';
import { healthLimiter } from './middleware/rateLimit.js';

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  PORT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 4000))
    .pipe(z.number().int().positive().max(65535)),
  CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),
});

const envResult = EnvSchema.safeParse(process.env);
if (!envResult.success) {
  const issues = envResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  console.error(`[startup] invalid env: ${issues}`);
  process.exit(1);
}
const env = envResult.data;

const origins = env.CORS_ORIGIN.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '8kb' }));

app.get('/health', healthLimiter, (_req, res) => {
  res.json({ ok: true });
});
app.use('/notify', notifyRouter);

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  console.error(
    JSON.stringify({
      level: 'error',
      status,
      msg: err.message,
      stack: err.stack,
      at: new Date().toISOString(),
    }),
  );
  res.status(status).json({ ok: false, error: status >= 500 ? 'internal' : 'bad_request' });
});

async function main() {
  try {
    await initDb(env.MONGODB_URI);
  } catch (err) {
    console.error('[startup] failed to initialize db', err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`api listening on :${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[shutdown] received ${signal}, closing…`);
    server.close(async (err) => {
      if (err) console.error('[shutdown] server close error', err);
      try {
        await closeDb();
      } catch (e) {
        console.error('[shutdown] db close error', e);
      }
      process.exit(err ? 1 : 0);
    });
    // Hard-exit backstop.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void main();
