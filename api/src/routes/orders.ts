import { Router } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { getConfig } from '../config.js';
import { getOrders, type OrderItem } from '../db.js';
import { asyncWrap } from '../lib/asyncWrap.js';
import { PRODUCTS } from '../lib/products.js';

const router = Router();

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const CartItem = z.object({
  productId: z.string().regex(ID_RE),
  quantity: z.number().int().min(1).max(10),
});

const CreateOrder = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  items: z.array(CartItem).min(1).max(20),
});

const VerifyBody = z.object({
  razorpay_order_id: z.string().min(1).max(128),
  razorpay_payment_id: z.string().min(1).max(128),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

router.post(
  '/',
  asyncWrap(async (req, res) => {
    const cfg = getConfig();
    if (!cfg.razorpay) {
      res.status(503).json({ ok: false, error: 'payments_unavailable' });
      return;
    }

    const parsed = CreateOrder.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'bad_request' });
      return;
    }

    let amount = 0;
    const items: OrderItem[] = [];
    for (const i of parsed.data.items) {
      const p = PRODUCTS[i.productId];
      if (!p || p.status === 'coming-soon') {
        res.status(400).json({ ok: false, error: 'unavailable', productId: i.productId });
        return;
      }
      amount += p.unitPrice * i.quantity;
      items.push({ productId: i.productId, quantity: i.quantity, unitPrice: p.unitPrice });
    }

    const rp = new Razorpay({
      key_id: cfg.razorpay.keyId,
      key_secret: cfg.razorpay.keySecret,
    });

    const order = await rp.orders.create({
      amount,
      currency: 'INR',
      receipt: `oc_${Date.now().toString(36)}`,
      notes: { email: parsed.data.email },
    });

    const now = new Date();
    await getOrders().insertOne({
      razorpayOrderId: order.id,
      items,
      amount,
      currency: 'INR',
      email: parsed.data.email,
      status: 'created',
      notes: { email: parsed.data.email },
      createdAt: now,
      updatedAt: now,
    });

    req.log.info(
      { razorpayOrderId: order.id, amount, email: parsed.data.email },
      'orders.created',
    );

    res.json({
      ok: true,
      orderId: order.id,
      amount,
      currency: 'INR',
      keyId: cfg.razorpay.keyId,
    });
  }),
);

router.post(
  '/verify',
  asyncWrap(async (req, res) => {
    const cfg = getConfig();
    if (!cfg.razorpay) {
      res.status(503).json({ ok: false, error: 'payments_unavailable' });
      return;
    }

    const parsed = VerifyBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: 'bad_request' });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const expected = crypto
      .createHmac('sha256', cfg.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuf = Buffer.from(razorpay_signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    const valid =
      sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) {
      req.log.warn({ razorpay_order_id }, 'orders.verify_bad_signature');
      res.status(400).json({ ok: false, error: 'signature_invalid' });
      return;
    }

    // Optimistic mark; webhook remains source of truth.
    await getOrders().updateOne(
      { razorpayOrderId: razorpay_order_id },
      {
        $set: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'paid',
          updatedAt: new Date(),
        },
      },
    );

    req.log.info({ razorpay_order_id, razorpay_payment_id }, 'orders.verified');
    res.json({ ok: true });
  }),
);

export default router;
