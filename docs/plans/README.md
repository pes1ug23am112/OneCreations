# Plan B — Deployment & Revenue

Each file here is an executable plan. All scaffolds are behind env flags; nothing breaks if keys are absent.

## Recommended execution order

1. **[plan-b1-b3-assets-and-deploy.md](plan-b1-b3-assets-and-deploy.md)** — Asset pipeline + DO droplet + Vercel. Must land before anything public.
2. **[plan-b7-observability.md](plan-b7-observability.md)** — Logger in place before real traffic; makes everything downstream debuggable.
3. **[plan-b4-resend-email.md](plan-b4-resend-email.md)** — Waitlist confirmation email. Lightest lift, fastest user-facing win.
4. **[plan-b5-b6-razorpay-checkout.md](plan-b5-b6-razorpay-checkout.md)** — Payments. Last because it's the heaviest and blocks on KYC.

Each plan is independent — phases 2–4 can re-order based on what credentials arrive first.
