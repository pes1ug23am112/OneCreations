import { Router } from 'express';
import { z } from 'zod';
import { getNotifications } from '../db.js';
import { asyncWrap } from '../lib/asyncWrap.js';
import {
  notifyEmailLimiter,
  notifyIpLimiter,
} from '../middleware/rateLimit.js';

const router = Router();

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SOURCE_RE = /^[a-z][a-z0-9_-]{0,31}$/;

const SubmitSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  productId: z.string().regex(ID_RE).nullable().optional(),
  source: z.string().regex(SOURCE_RE).optional().default('web'),
});

router.post(
  '/',
  notifyIpLimiter,
  notifyEmailLimiter,
  asyncWrap(async (req, res) => {
    const parsed = SubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'Invalid request.' });
      return;
    }

    const { email, productId, source } = parsed.data;
    const pid = productId ?? null;

    const col = getNotifications();
    await col.updateOne(
      { email, productId: pid },
      {
        $setOnInsert: {
          email,
          productId: pid,
          createdAt: new Date(),
          source,
        },
      },
      { upsert: true },
    );

    res.json({ ok: true });
  }),
);

export default router;
