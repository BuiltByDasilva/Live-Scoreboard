# Live Scoreboard Monetization Backend

This folder contains the Supabase Edge Functions and Postgres migration needed to unlock paid skins after Stripe confirms payment.

## Functions

- `checkout` creates a Stripe Checkout Session for one of the extension SKUs.
- `stripe-webhook` receives `checkout.session.completed` and applies the entitlement once.
- `entitlements` lets the extension restore purchases and redeem five-pack skin credits.

## Required Supabase secrets

Set these before deploying the functions:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_SKIN_SINGLE=price_...
supabase secrets set STRIPE_PRICE_SKIN_FIVE=price_...
supabase secrets set STRIPE_PRICE_SKINS_ALL_2026=price_...
supabase secrets set CHECKOUT_RETURN_URL=https://livescoreboard.app/checkout
```

Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in deployed Edge Functions.

## Deploy order

```bash
supabase db push
supabase functions deploy checkout
supabase functions deploy entitlements
supabase functions deploy stripe-webhook
```

Then add the deployed `stripe-webhook` URL as a Stripe webhook endpoint for `checkout.session.completed`.

Update `MONETIZATION_API_BASE` in `src/monetization.js` to your deployed functions base URL or to the custom API domain that forwards to Supabase.
