import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import notifyRouter from './routes/notify.js';

const app = express();

const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json({ limit: '8kb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/notify', notifyRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`api listening on :${port}`);
});
