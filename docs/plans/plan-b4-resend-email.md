# Plan B4 — Resend Transactional Email

Status: **not executed** — scaffolds behind `RESEND_API_KEY` env flag.

## Context

When a visitor drops their email on the waitlist, the only current feedback is the UI banner. A confirmation email is the first real touchpoint — it proves the submission landed, starts a sender-reputation trail on the domain, and gives you a reason to re-engage them later. Resend is the cleanest path (simple SDK, React email templates optional, generous free tier).

The send path must be **fire-and-forget** — a Resend outage must never cause `/notify` to return 500. User gets 200 either way; we log and move on.

## Prerequisites before executing

- [ ] Resend account created at resend.com.
- [ ] Sending domain `onecreations.in` verified in Resend (DKIM + SPF + DMARC records added to DNS).
- [ ] Sender identity picked: `OneCreations <hello@onecreations.in>`.
- [ ] `RESEND_API_KEY` copied.

## Steps

### 1. Install SDK (api)

```
cd api && npm install resend
```

### 2. Extend the env schema

In [api/src/index.ts](api/src/index.ts) `EnvSchema`, add:

```ts
RESEND_API_KEY: z.string().optional(),
EMAIL_FROM: z.string().default('OneCreations <hello@onecreations.in>'),
```

Do **not** make `RESEND_API_KEY` required — production boots without it; emails just no-op.

### 3. Email module

Create `api/src/lib/email.ts`:

```ts
import { Resend } from 'resend';

let client: Resend | null = null;

export function initEmail(apiKey: string | undefined): void {
  client = apiKey ? new Resend(apiKey) : null;
}

export function emailEnabled(): boolean {
  return client !== null;
}

type WaitlistArgs = { to: string; productName?: string; from: string };

export async function sendWaitlistConfirmation({ to, productName, from }: WaitlistArgs): Promise<void> {
  if (!client) return;
  const subject = productName ? `You're on the list — ${productName}` : `You're on the list`;
  const piece = productName ? `the <strong>${escapeHtml(productName)}</strong>` : 'our next drop';
  await client.emails.send({
    from,
    to,
    subject,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system; color:#1a1a1a; max-width:520px;">
        <p>Thanks — you're on the list for ${piece}.</p>
        <p>When orders open, you'll be one of the first notified. One email per piece, nothing else.</p>
        <p style="color:#6b6b6b;font-size:12px;margin-top:32px;">OneCreations · Bangalore · onecreations.in</p>
      </div>
    `.trim(),
    text: `Thanks — you're on the list${productName ? ` for ${productName}` : ''}. When orders open, you'll be one of the first notified.`,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]!);
}
```

### 4. Wire into `/notify`

The route currently only receives `productId`. To include a friendly product name, add an optional product lookup map on the api side (duplicates the web catalog — that's fine for a 6-entry catalog; migrate to a shared package later).

Create `api/src/lib/products.ts`:
```ts
export const PRODUCT_NAMES: Record<string, string> = {
  'shibuya-rainscape': 'Shibuya Rainscape',
  'pit-lane-suzuka': 'Pit Lane — Suzuka',
  'kei-garage': 'Kei Garage — Nishinomiya',
  'rooftop-bangalore': 'Rooftop — Bangalore',
  'canyon-pullout': 'Canyon Pullout — PCH',
  'display-stand-trio': 'Display Stand — Trio',
};
```

In [api/src/routes/notify.ts](api/src/routes/notify.ts) after the successful `updateOne`, before `res.json({ ok: true })`:

```ts
// Fire-and-forget; failures MUST NOT break the 200 response.
if (emailEnabled()) {
  void sendWaitlistConfirmation({
    to: email,
    productName: pid ? PRODUCT_NAMES[pid] : undefined,
    from: env.EMAIL_FROM,
  }).catch((err) => {
    console.error(JSON.stringify({ level: 'error', msg: 'email send failed', to: email, err: err?.message }));
  });
}
```

Export `env` from `index.ts` (or pass it down via a small `config.ts` module — preferred to avoid circular imports).

### 5. Init on startup

In `main()` in [api/src/index.ts](api/src/index.ts), after `initDb`:
```ts
initEmail(env.RESEND_API_KEY);
console.log(`[startup] email ${emailEnabled() ? 'enabled' : 'disabled (no key)'}`);
```

### 6. Duplicate-send guard

`/notify` uses upsert — a user re-submitting the same email for the same product hits `$setOnInsert` (no new doc) but the email would still fire. Gate the send on "did we actually insert?":

```ts
const result = await col.updateOne(..., { upsert: true });
const inserted = result.upsertedCount > 0;
if (inserted && emailEnabled()) { /* send */ }
```

### 7. Update `api/.env.example`

```
RESEND_API_KEY=
EMAIL_FROM=OneCreations <hello@onecreations.in>
```

## Files created / modified

- `api/src/lib/email.ts` (new)
- `api/src/lib/products.ts` (new)
- `api/src/routes/notify.ts` (fire-and-forget send on insert)
- `api/src/index.ts` (env schema + `initEmail`)
- `api/.env.example` (new keys)
- `api/package.json` (+ resend)

## Verification

1. Without `RESEND_API_KEY` set: startup logs `email disabled (no key)`; `/notify` still returns 200; no network calls.
2. With key set: startup logs `email enabled`; POST `/notify` with a fresh email → 200 + email arrives at inbox within seconds.
3. POST `/notify` with the **same** email and productId again → 200 + **no** duplicate email (upsert guard worked).
4. Deliberately break Resend (put a junk key): `/notify` still returns 200; error JSON appears in server logs; no 500.
5. Deliverability: send to a Gmail and check SPF/DKIM/DMARC all pass in the header (mail-tester.com score ≥ 8/10).
