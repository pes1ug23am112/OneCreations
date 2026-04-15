import rateLimit from 'express-rate-limit';

export const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const notifyIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, slow down.' },
});

export const notifyEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, slow down.' },
  keyGenerator: (req) => {
    const raw = req.body?.email;
    const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    return `email:${email}`;
  },
  skip: (req) => typeof req.body?.email !== 'string' || req.body.email.length === 0,
});
