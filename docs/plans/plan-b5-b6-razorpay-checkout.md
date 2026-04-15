# Plan B5 + B6 — Razorpay Checkout & Webhook

Status: **not executed** — scaffolds behind `RAZORPAY_*` env flags. Payments code; do not ship without full test-key validation.

## Context

Revenue. Visitors need to actually pay for a diorama. Razorpay is the India-native choice (UPI + cards + netbanking + INR settlement, Student-Pack-friendly KYC for sole proprietors).

Flow:
1. User adds pieces to a **cart** (React context + localStorage) on the frontend.
2. On checkout, the frontend POSTs the cart to the API; API creates a Razorpay Order server-side with the key secret and returns the `orderId` + the **public** key id.
3. Razorpay Checkout widget opens in the browser, user pays.
4. On success, Razorpay calls back with `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`. Frontend sends these to `/orders/verify`.
5. API verifies the HMAC-SHA256 signature with the secret. If valid, flip the order to `paid` in Mongo.
6. **Independently**, Razorpay hits `/webhooks/razorpay` server-to-server with the same event. This is the source of truth — clients can lie; webhooks can't (when signed). Use the webhook to mark fulfillment state; treat the frontend verify as a UX hint only.

Cart is **multi-item** (React context + localStorage), per user decision.

## Prerequisites before executing

- [ ] Razorpay account created; KYC submitted (founder-side, days-weeks timeline).
- [ ] Test mode keys (`rzp_test_...`) in hand.
- [ ] Webhook endpoint URL decided: `https://api.onecreations.in/webhooks/razorpay`.
- [ ] Webhook secret generated in Razorpay dashboard.

## Steps

### 1. Install SDK + types (api)

```
cd api && npm install razorpay
```

### 2. Env schema additions

In [api/src/index.ts](api/src/index.ts) `EnvSchema`:
```ts
RAZORPAY_KEY_ID: z.string().optional(),
RAZORPAY_KEY_SECRET: z.string().optional(),
RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
```
All optional — server boots without payments configured. Payment routes respond 503 if unset.

### 3. Orders collection

Extend `api/src/db.ts`:

```ts
export type OrderDoc = {
  _id?: unknown;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  amount: number;        // in paise
  currency: 'INR';
  email: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  notes?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
};
```

Add index creation inside `initDb`:
```ts
await db.collection<OrderDoc>('orders').createIndex({ razorpayOrderId: 1 }, { unique: true });
await db.collection<OrderDoc>('orders').createIndex({ email: 1, createdAt: -1 });
```

Export `getOrders(): Collection<OrderDoc>`.

### 4. Canonical product prices (api)

Clients cannot be trusted for prices. Extend `api/src/lib/products.ts`:
```ts
export type ProductPricing = { name: string; unitPrice: number /* paise */; status: 'available' | 'preorder' | 'coming-soon' };
export const PRODUCTS: Record<string, ProductPricing> = {
  'rooftop-bangalore':   { name: 'Rooftop — Bangalore',     unitPrice: 380_000, status: 'available' },
  'display-stand-trio':  { name: 'Display Stand — Trio',    unitPrice: 190_000, status: 'available' },
  'kei-garage':          { name: 'Kei Garage — Nishinomiya',unitPrice: 420_000, status: 'preorder'  },
  // coming-soon pieces are intentionally absent; checkout for them returns 400.
};
```

### 5. `/orders` route (create order)

Create `api/src/routes/orders.ts`:

```ts
import { Router } from 'express';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { asyncWrap } from '../lib/asyncWrap.js';
import { getOrders } from '../db.js';
import { PRODUCTS } from '../lib/products.js';
import { config } from '../config.js'; // factored out of index.ts

const router = Router();

const CartItem = z.object({
  productId: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  quantity: z.number().int().min(1).max(10),
});
const CreateOrder = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  items: z.array(CartItem).min(1).max(20),
});

router.post('/', asyncWrap(async (req, res) => {
  if (!config.razorpay) { res.status(503).json({ ok: false, error: 'payments_unavailable' }); return; }
  const parsed = CreateOrder.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ ok: false, error: 'bad_request' }); return; }

  let amount = 0;
  const items = parsed.data.items.map((i) => {
    const p = PRODUCTS[i.productId];
    if (!p || p.status === 'coming-soon') throw Object.assign(new Error('unavailable'), { status: 400 });
    amount += p.unitPrice * i.quantity;
    return { productId: i.productId, quantity: i.quantity, unitPrice: p.unitPrice };
  });

  const rp = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
  const order = await rp.orders.create({
    amount, currency: 'INR', receipt: `oc_${Date.now().toString(36)}`,
    notes: { email: parsed.data.email },
  });

  const now = new Date();
  await getOrders().insertOne({
    razorpayOrderId: order.id, items, amount, currency: 'INR',
    email: parsed.data.email, status: 'created', createdAt: now, updatedAt: now,
  });

  res.json({ ok: true, orderId: order.id, amount, currency: 'INR', keyId: config.razorpay.keyId });
}));

export default router;
```

Mount in [api/src/index.ts](api/src/index.ts): `app.use('/orders', ordersRouter);`.

### 6. `/orders/verify` route (client-side confirmation)

Append to the same router:

```ts
import crypto from 'node:crypto';

const VerifyBody = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

router.post('/verify', asyncWrap(async (req, res) => {
  if (!config.razorpay) { res.status(503).json({ ok: false }); return; }
  const p = VerifyBody.safeParse(req.body);
  if (!p.success) { res.status(400).json({ ok: false }); return; }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = p.data;

  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
  if (!ok) { res.status(400).json({ ok: false, error: 'signature_invalid' }); return; }

  // Optimistic mark; webhook remains source of truth.
  await getOrders().updateOne(
    { razorpayOrderId: razorpay_order_id },
    { $set: { razorpayPaymentId: razorpay_payment_id, status: 'paid', updatedAt: new Date() } },
  );
  res.json({ ok: true });
}));
```

### 7. `/webhooks/razorpay` route (server-to-server truth)

Create `api/src/routes/webhooks.ts`. **Critical**: this route needs the raw body for HMAC verification, so mount it **before** `express.json()` and use `express.raw()` scoped to the path.

```ts
import { Router, raw } from 'express';
import crypto from 'node:crypto';
import { asyncWrap } from '../lib/asyncWrap.js';
import { getOrders } from '../db.js';
import { config } from '../config.js';

const router = Router();

router.post(
  '/razorpay',
  raw({ type: 'application/json', limit: '64kb' }),
  asyncWrap(async (req, res) => {
    if (!config.razorpay?.webhookSecret) { res.status(503).json({ ok: false }); return; }
    const sig = req.header('x-razorpay-signature') ?? '';
    const body = req.body as Buffer;
    const expected = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(body)
      .digest('hex');
    const ok = sig.length === expected.length
      && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) { res.status(400).json({ ok: false }); return; }

    const event = JSON.parse(body.toString('utf8')) as {
      event: string;
      payload: { payment?: { entity: { order_id: string; id: string; status: string } } };
    };

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment?.entity;
      if (payment) {
        await getOrders().updateOne(
          { razorpayOrderId: payment.order_id },
          { $set: { razorpayPaymentId: payment.id, status: 'paid', updatedAt: new Date() } },
        );
        // TODO: enqueue fulfillment email via Resend (Plan B4).
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment?.entity;
      if (payment) {
        await getOrders().updateOne(
          { razorpayOrderId: payment.order_id },
          { $set: { status: 'failed', updatedAt: new Date() } },
        );
      }
    }

    res.json({ ok: true });
  }),
);

export default router;
```

**Mounting order matters** — in [api/src/index.ts](api/src/index.ts):
```ts
app.use('/webhooks', webhooksRouter);   // BEFORE express.json()
app.use(express.json({ limit: '8kb' }));
app.use('/notify', notifyRouter);
app.use('/orders', ordersRouter);
```

### 8. Frontend — cart context

Create `web/lib/cart.tsx`:

```tsx
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { productId: string; quantity: number };
type CartCtx = {
  items: CartItem[];
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: number;
};
const C = createContext<CartCtx | null>(null);
const KEY = "oc.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const api = useMemo<CartCtx>(() => ({
    items,
    add: (id, q = 1) => setItems((xs) => {
      const i = xs.findIndex((x) => x.productId === id);
      if (i === -1) return [...xs, { productId: id, quantity: q }];
      const next = [...xs]; next[i] = { ...next[i], quantity: Math.min(10, next[i].quantity + q) };
      return next;
    }),
    remove: (id) => setItems((xs) => xs.filter((x) => x.productId !== id)),
    setQuantity: (id, q) => setItems((xs) =>
      xs.map((x) => (x.productId === id ? { ...x, quantity: Math.max(1, Math.min(10, q)) } : x))
    ),
    clear: () => setItems([]),
    count: items.reduce((n, x) => n + x.quantity, 0),
  }), [items]);

  return <C.Provider value={api}>{children}</C.Provider>;
}

export function useCart(): CartCtx {
  const v = useContext(C);
  if (!v) throw new Error("useCart must be inside <CartProvider>");
  return v;
}
```

Wrap the app in [web/app/layout.tsx](web/app/layout.tsx) body with `<CartProvider>`.

### 9. Frontend — product page "Add to cart" + header indicator

- On `web/app/products/[slug]/page.tsx`: replace the NotifyForm-only CTA for `available` products with an "Add to cart" button that calls `cart.add(product.id)`.
- Keep NotifyForm for `preorder` / `coming-soon`.
- Add a cart indicator to [web/components/Header.tsx](web/components/Header.tsx): `<Link href="/cart">Cart ({count})</Link>`.

### 10. Frontend — `/cart` page + checkout

Create `web/app/cart/page.tsx` (client component). List items, quantity inputs, subtotal. A "Checkout" button that:

1. POSTs `{ email, items }` to `${NEXT_PUBLIC_API_URL}/orders`.
2. Receives `{ orderId, amount, currency, keyId }`.
3. Opens Razorpay Checkout: load `https://checkout.razorpay.com/v1/checkout.js` via `<Script>` from `next/script`.
4. On success handler, POST the payment payload to `/orders/verify`, clear the cart, show a success state.

Inline sketch:
```tsx
declare global { interface Window { Razorpay: new (opts: object) => { open(): void } } }

async function onCheckout() {
  const res = await fetch(`${API}/orders`, { /* ... */ }).then(r => r.json());
  const rzp = new window.Razorpay({
    key: res.keyId,
    order_id: res.orderId,
    amount: res.amount,
    currency: res.currency,
    name: "OneCreations",
    handler: async (p: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      await fetch(`${API}/orders/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(p) });
      cart.clear();
      router.push("/cart/success");
    },
    prefill: { email },
    theme: { color: "#000000" },
  });
  rzp.open();
}
```

Add `web/app/cart/success/page.tsx` and a simple "payment failed, try again" route.

### 11. Register webhook in Razorpay dashboard

After deploy: Dashboard → Webhooks → add `https://api.onecreations.in/webhooks/razorpay`, secret = `RAZORPAY_WEBHOOK_SECRET`. Events: `payment.captured`, `payment.failed`, `payment.refunded`.

## Files created / modified

- `api/src/routes/orders.ts` (new)
- `api/src/routes/webhooks.ts` (new)
- `api/src/lib/products.ts` (extend)
- `api/src/db.ts` (OrderDoc + indexes + `getOrders`)
- `api/src/config.ts` (new — shared env export)
- `api/src/index.ts` (mount webhooks before `express.json()`; mount `/orders`)
- `api/.env.example` (Razorpay keys)
- `api/package.json` (+ razorpay)
- `web/lib/cart.tsx` (new)
- `web/app/layout.tsx` (wrap in CartProvider)
- `web/components/Header.tsx` (cart badge)
- `web/app/products/[slug]/page.tsx` (add-to-cart button)
- `web/app/cart/page.tsx` (new)
- `web/app/cart/success/page.tsx` (new)

## Verification (all in **test mode**)

1. Boot API without `RAZORPAY_*` — POST `/orders` returns 503. Frontend cart page shows "Checkout temporarily unavailable."
2. Boot with test keys — POST `/orders` with a valid cart returns `orderId`, `amount`, `keyId`; order doc appears in Mongo with `status: created`.
3. Razorpay Checkout opens, complete with test card `4111 1111 1111 1111`. Order flips to `paid` via `/orders/verify`.
4. Tamper with signature in the verify POST → 400 `signature_invalid`; order stays `created`.
5. Razorpay dashboard → "Send test webhook" for `payment.captured` → order doc updates via the webhook path (raw body path intact).
6. Send a webhook with wrong `x-razorpay-signature` → 400; order unchanged.
7. Try to check out a `coming-soon` product → 400 from `/orders`.
8. Tamper with `unitPrice` in the cart POST → price is ignored (server reads from `PRODUCTS`); total equals the canonical total.
9. Cart persistence: add items, reload page, items still there (localStorage).
10. End-to-end in prod mode: place a ₹1 real order, confirm settlement in Razorpay dashboard and `paid` status in Mongo.
