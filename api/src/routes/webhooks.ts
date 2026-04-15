import crypto from 'node:crypto';
import { Router, raw } from 'express';
import { getConfig } from '../config.js';
import { getOrders, type OrderStatus } from '../db.js';
import { asyncWrap } from '../lib/asyncWrap.js';
import { sendOrderReceipt } from '../lib/email.js';
import { logger } from '../lib/logger.js';

const router = Router();

type RazorpayEvent = {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        status: string;
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
      };
    };
  };
};

// Razorpay HMAC verify requires the exact raw request bytes.
// Mount express.raw() scoped to this path BEFORE express.json() in index.ts.
router.post(
  '/razorpay',
  raw({ type: 'application/json', limit: '64kb' }),
  asyncWrap(async (req, res) => {
    const cfg = getConfig();
    if (!cfg.razorpay?.webhookSecret) {
      res.status(503).json({ ok: false, error: 'webhook_unconfigured' });
      return;
    }

    const sigHeader = req.header('x-razorpay-signature') ?? '';
    const body = req.body as Buffer;

    if (!Buffer.isBuffer(body) || body.length === 0) {
      res.status(400).json({ ok: false, error: 'empty_body' });
      return;
    }

    const expected = crypto
      .createHmac('sha256', cfg.razorpay.webhookSecret)
      .update(body)
      .digest('hex');

    const sigBuf = Buffer.from(sigHeader, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    const valid =
      sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) {
      req.log.warn('webhooks.razorpay_bad_signature');
      res.status(400).json({ ok: false, error: 'signature_invalid' });
      return;
    }

    let event: RazorpayEvent;
    try {
      event = JSON.parse(body.toString('utf8')) as RazorpayEvent;
    } catch {
      res.status(400).json({ ok: false, error: 'bad_json' });
      return;
    }

    const orders = getOrders();
    const now = new Date();

    if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
      // Status flip only. Receipts fire on `order.paid` so we don't double-send
      // when both events arrive for the same order.
      const payment = event.payload.payment?.entity;
      if (payment) {
        await orders.updateOne(
          { razorpayOrderId: payment.order_id },
          {
            $set: {
              razorpayPaymentId: payment.id,
              status: 'paid' satisfies OrderStatus,
              updatedAt: now,
            },
          },
        );
        req.log.info(
          { razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, event: event.event },
          'webhooks.payment_succeeded',
        );
      }
    } else if (event.event === 'order.paid') {
      // Receipt trigger. `order.paid` fires once the full order amount has been
      // captured — the canonical "done" signal. Guarded with an atomic
      // findOneAndUpdate on receiptSentAt so webhook retries are safe.
      const orderEntity = event.payload.order?.entity;
      const payment = event.payload.payment?.entity;
      if (orderEntity) {
        const claimed = await orders.findOneAndUpdate(
          { razorpayOrderId: orderEntity.id, receiptSentAt: { $exists: false } },
          {
            $set: {
              status: 'paid' satisfies OrderStatus,
              receiptSentAt: now,
              updatedAt: now,
              ...(payment?.id ? { razorpayPaymentId: payment.id } : {}),
            },
          },
          { returnDocument: 'after' },
        );

        if (!claimed) {
          // Either the order doesn't exist, or the receipt was already sent by
          // a prior delivery of this webhook. Either way, ack and move on.
          req.log.info(
            { razorpayOrderId: orderEntity.id },
            'webhooks.order_paid_already_handled',
          );
        } else {
          req.log.info(
            { razorpayOrderId: orderEntity.id, email: claimed.email },
            'webhooks.order_paid_receipt_claimed',
          );

          // Fire-and-forget: a Resend hiccup must not 500 the webhook, because
          // that triggers a Razorpay retry — and we've already marked the
          // receipt sent. If the send fails, clear receiptSentAt so a retry can
          // try again; we accept the (rare) risk of a duplicate over the
          // (worse) risk of a silent lost receipt.
          void sendOrderReceipt({
            to: claimed.email,
            orderId: claimed.razorpayOrderId,
            paymentId: claimed.razorpayPaymentId,
            items: claimed.items,
            amount: claimed.amount,
            currency: claimed.currency,
          }).catch(async (err) => {
            logger.error(
              { err, razorpayOrderId: orderEntity.id },
              'webhooks.receipt_send_failed',
            );
            await orders
              .updateOne(
                { razorpayOrderId: orderEntity.id },
                { $unset: { receiptSentAt: '' } },
              )
              .catch((e) =>
                logger.error({ err: e }, 'webhooks.receipt_rollback_failed'),
              );
          });
        }
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment?.entity;
      if (payment) {
        await orders.updateOne(
          { razorpayOrderId: payment.order_id },
          { $set: { status: 'failed' satisfies OrderStatus, updatedAt: now } },
        );
        req.log.info(
          { razorpayOrderId: payment.order_id },
          'webhooks.payment_failed',
        );
      }
    } else if (event.event === 'refund.processed' || event.event === 'refund.created') {
      const refund = event.payload.refund?.entity;
      if (refund) {
        // Look up the order by paymentId since refunds don't carry order_id.
        await orders.updateOne(
          { razorpayPaymentId: refund.payment_id },
          { $set: { status: 'refunded' satisfies OrderStatus, updatedAt: now } },
        );
        req.log.info({ refundId: refund.id }, 'webhooks.refund_processed');
      }
    } else {
      req.log.debug({ event: event.event }, 'webhooks.unhandled_event');
    }

    res.json({ ok: true });
  }),
);

export default router;
