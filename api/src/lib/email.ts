import { Resend } from 'resend';
import { logger } from './logger.js';
import { productName } from './products.js';
import type { OrderItem } from '../db.js';

let client: Resend | null = null;
let fromAddress: string | null = null;

export function initEmail(apiKey: string | undefined, from: string): void {
  if (apiKey) {
    client = new Resend(apiKey);
    fromAddress = from;
    logger.info({ from }, 'email.initialized');
  } else {
    client = null;
    fromAddress = null;
    logger.info('email.disabled_no_key');
  }
}

export function emailEnabled(): boolean {
  return client !== null;
}

type WaitlistArgs = { to: string; productName?: string };

export async function sendWaitlistConfirmation({ to, productName }: WaitlistArgs): Promise<void> {
  if (!client || !fromAddress) return;
  const subject = productName ? `You're on the list — ${productName}` : `You're on the list`;
  const piece = productName ? `the <strong>${escapeHtml(productName)}</strong>` : 'our next drop';
  await client.emails.send({
    from: fromAddress,
    to,
    subject,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system; color:#1a1a1a; max-width:520px; line-height:1.55;">
        <p>Thanks — you're on the list for ${piece}.</p>
        <p>When orders open, you'll be one of the first notified. One email per piece, nothing else.</p>
        <p style="color:#6b6b6b;font-size:12px;margin-top:32px;">OneCreations · Bangalore · <a href="https://onecreations.in" style="color:#6b6b6b;">onecreations.in</a></p>
      </div>
    `.trim(),
    text: `Thanks — you're on the list${productName ? ` for ${productName}` : ''}. When orders open, you'll be one of the first notified.`,
  });
}

type OrderReceiptArgs = {
  to: string;
  orderId: string;
  paymentId?: string;
  items: OrderItem[];
  amount: number; // paise
  currency: 'INR';
};

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export async function sendOrderReceipt(args: OrderReceiptArgs): Promise<void> {
  if (!client || !fromAddress) return;
  const { to, orderId, paymentId, items, amount } = args;

  const rows = items
    .map((i) => {
      const name = productName(i.productId) ?? i.productId;
      const line = i.unitPrice * i.quantity;
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(name)} × ${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatInr(line)}</td>
        </tr>
      `.trim();
    })
    .join('');

  const subject = `Order confirmed — ${formatInr(amount)} · OneCreations`;
  await client.emails.send({
    from: fromAddress,
    to,
    subject,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system; color:#1a1a1a; max-width:560px; line-height:1.55;">
        <h2 style="font-family: Georgia, serif; font-weight: 400; margin:0 0 8px;">Order confirmed</h2>
        <p style="margin:0 0 20px;color:#4a4a4a;">Thanks — payment captured. We're printing your piece. You'll get another email with an ETA once it ships.</p>

        <table style="width:100%;border-collapse:collapse;margin:0 0 12px;">
          ${rows}
          <tr>
            <td style="padding:12px 0 0;font-weight:600;">Total</td>
            <td style="padding:12px 0 0;text-align:right;font-weight:600;">${formatInr(amount)}</td>
          </tr>
        </table>

        <p style="margin:20px 0 4px;color:#6b6b6b;font-size:12px;">Order ID · <span style="font-family:ui-monospace,monospace;">${escapeHtml(orderId)}</span></p>
        ${paymentId ? `<p style="margin:0 0 20px;color:#6b6b6b;font-size:12px;">Payment ID · <span style="font-family:ui-monospace,monospace;">${escapeHtml(paymentId)}</span></p>` : ''}

        <p style="color:#6b6b6b;font-size:12px;margin-top:32px;">OneCreations · Bangalore · <a href="https://onecreations.in" style="color:#6b6b6b;">onecreations.in</a></p>
      </div>
    `.trim(),
    text:
      `Order confirmed — ${formatInr(amount)}\n\n` +
      items
        .map((i) => `${productName(i.productId) ?? i.productId} × ${i.quantity} — ${formatInr(i.unitPrice * i.quantity)}`)
        .join('\n') +
      `\n\nTotal: ${formatInr(amount)}\nOrder ID: ${orderId}${paymentId ? `\nPayment ID: ${paymentId}` : ''}\n\nOneCreations · onecreations.in`,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return c;
    }
  });
}
