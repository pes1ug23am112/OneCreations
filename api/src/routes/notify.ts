import { Router } from 'express';
import { z } from 'zod';
import { getNotifications } from '../db.js';
import { notifyLimiter } from '../middleware/rateLimit.js';

const router = Router();

const SubmitSchema = z.object({
  email: z.string().email().max(254),
  productId: z.string().max(64).nullable().optional(),
  source: z.string().max(64).optional(),
});

router.post('/', notifyLimiter, async (req, res) => {
  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid request.' });
  }

  const { email, productId = null, source = 'web' } = parsed.data;
  const normalized = email.trim().toLowerCase();
  const pid = productId ?? null;

  const col = await getNotifications();
  await col.updateOne(
    { email: normalized, productId: pid },
    {
      $setOnInsert: {
        email: normalized,
        productId: pid,
        createdAt: new Date(),
        source,
      },
    },
    { upsert: true }
  );

  return res.json({ ok: true });
});

export default router;
