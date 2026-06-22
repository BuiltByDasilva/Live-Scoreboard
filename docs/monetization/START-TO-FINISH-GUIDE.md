# Live Scoreboard Skins Monetization

Current as of June 22, 2026. This is a product and technical compliance plan, not legal or tax advice.

## Executive Decision

Use **Stripe-hosted Checkout Sessions** for one-time skin purchases, **Supabase Postgres + Edge Functions** for payment orchestration and entitlements, and a random extension license ID stored in `chrome.storage.sync` for automatic unlock and cross-device restoration.

This is the recommended MVP because:

- Stripe has no setup or monthly fee on standard pricing.
- Card information is entered on Stripe's hosted HTTPS page, never inside the extension.
- The extension contains no Stripe secret and no remotely hosted JavaScript.
- A signed Stripe webhook grants the entitlement even if the user closes the checkout page.
- The extension can detect the entitlement and unlock the skin automatically.
- Supabase provides a database and server-side functions in one free-tier service, subject to its current limits.

Chrome Web Store's own payment and licensing systems are deprecated. Google explicitly requires affected developers to use another payment processor and their own license tracking.

## Product Catalog

| SKU | Customer receives | Price | Important promise |
| --- | --- | ---: | --- |
| `skin_single` | One selected 2026 country-inspired skin | $0.99 | Permanent access to that selected skin |
| `skin_five` | Five skin credits | $2.99 | Customer selects any five 2026 skins |
| `skins_all_2026` | Every 2026 skin in this extension | $9.99 | All current 2026 skins; do not imply future tournaments |

For the five-pack, the server grants five credits. Selecting a skin consumes one credit on the server. Never let the extension award or spend credits by editing local state alone.

### Unit Economics

Illustrative net proceeds using Stripe's listed US domestic online-card rate of 2.9% + $0.30, before tax products, refunds, disputes, or international-card fees:

| Offer | Price | Approximate Stripe fee | Approximate proceeds |
| --- | ---: | ---: | ---: |
| One skin | $0.99 | $0.33 | $0.66 |
| Five skins | $2.99 | $0.39 | $2.60 |
| All 2026 skins | $9.99 | $0.59 | $9.40 |

The $0.99 item is useful as an impulse entry product, but the fixed processing fee makes bundles materially healthier. Make the five-pack the visually recommended offer. Do not use fake countdowns, fake scarcity, or preselected purchases.

## Purchase Architecture

1. The extension creates a random 128-bit `license_id` and stores it in `chrome.storage.sync`.
2. The user chooses a skin or bundle.
3. The extension sends `license_id`, `sku`, and any selected `skin_id` to `POST /checkout` over HTTPS.
4. The server validates the SKU and chooses the Stripe Price ID. It never accepts an amount supplied by the extension.
5. The server creates a one-time Stripe Checkout Session with `client_reference_id=license_id` and purchase metadata.
6. The extension opens the returned Stripe-hosted URL in a new tab. No `tabs` permission is required merely to create a tab.
7. Stripe collects the customer's email and payment details.
8. Stripe sends `checkout.session.completed` to `POST /stripe-webhook`.
9. The webhook verifies the Stripe signature, handles the event idempotently, and writes the order and entitlement.
10. The extension polls `GET /entitlements/{license_id}` while checkout is pending and whenever the Skins tab opens.
11. The newly purchased skin or credits appear automatically, and the extension updates its cached local display state.

The webhook is the source of truth. The success redirect is only a customer experience and must never grant access by itself.

## Required Backend Endpoints

### `POST /checkout`

Input:

```json
{
  "licenseId": "random-unguessable-id",
  "sku": "skin_single",
  "skinId": "bra"
}
```

Server responsibilities:

- Validate the license ID format.
- Validate the SKU against a fixed allowlist.
- Validate the skin ID against the packaged skin catalog.
- Select the server-side Stripe Price ID.
- Add `license_id`, `sku`, and `skin_id` to Checkout metadata.
- Return only `{ "checkoutUrl": "https://checkout.stripe.com/..." }`.

### `POST /stripe-webhook`

Server responsibilities:

- Read the raw request body.
- Verify `Stripe-Signature` using `STRIPE_WEBHOOK_SECRET`.
- Handle `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
- Ignore duplicate event IDs.
- Confirm `payment_status` is paid before fulfillment.
- Create the order and entitlement in one database transaction.
- Handle refunds and disputes according to the published refund policy.

### `GET /entitlements/{license_id}`

Returns only the customer's product rights:

```json
{
  "skins": ["bra", "mex"],
  "credits": 3,
  "all2026": false,
  "updatedAt": "2026-06-22T20:00:00Z"
}
```

Do not return payment details or unnecessary personal data.

### `POST /credits/redeem`

Input: `license_id` and `skin_id`. Use a database transaction to confirm a positive credit balance, subtract one credit, and add the selected skin exactly once.

## Database Tables

### `licenses`

- `id_hash` - hash of the random license ID, primary key
- `created_at`
- `last_seen_at`
- `status` - active, suspended, refunded

### `orders`

- `stripe_session_id` - unique
- `stripe_payment_intent_id` - unique when present
- `license_id_hash`
- `sku`
- `skin_id` - nullable
- `amount_total`
- `currency`
- `payment_status`
- `created_at`

### `entitlements`

- `license_id_hash`
- `entitlement_type` - skin, credits, all_2026
- `entitlement_key` - country skin ID where applicable
- `quantity`
- `source_order_id`
- `revoked_at` - nullable
- unique constraint on license + type + key

### `webhook_events`

- `stripe_event_id` - primary key
- `event_type`
- `processed_at`
- `result`

Store the hash of the license ID in the database, not the raw ID. Rate-limit checkout creation, entitlement reads, and credit redemption.

## Secrets and Configuration

Store these only in Supabase Edge Function secrets or another server-side secret manager:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_SKIN_SINGLE
STRIPE_PRICE_SKIN_FIVE
STRIPE_PRICE_SKINS_ALL_2026
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Never put any `sk_...`, `whsec_...`, database service-role key, or unrestricted API key in the extension package, GitHub repository, client JavaScript, or Chrome storage.

## What You Must Set Up

### 1. Business identity

- Decide whether payments are accepted as an individual/sole proprietor or a registered business.
- Use a dedicated support email that you check frequently.
- Have a bank account for Stripe payouts.
- Publish a real website with support, privacy, terms, and refund pages.
- Use a recognizable statement descriptor such as `LIVE SCORE` to reduce disputes.

### 2. Stripe account

- Create a Stripe account and complete identity/business verification.
- Add the payout bank account.
- Enable a passkey, security key, or strong two-factor authentication.
- Complete public business name, website, support contact, and statement descriptor.
- Start in a Stripe Sandbox; do not share keys in chat.
- Create three one-time Products/Prices for $0.99, $2.99, and $9.99 USD.
- Turn on Stripe receipts.
- Configure Stripe Tax only after determining where registration is required. Stripe is a payment processor, not automatically your merchant of record.

### 3. Supabase project

- Create a project in the region closest to the primary customer base.
- Create the four tables and Row Level Security policies.
- Deploy the four Edge Function endpoints.
- Add Stripe and Supabase secrets using the dashboard or CLI.
- Allow HTTPS calls only from the production extension and approved web checkout origin where practical.

### 4. Website and policies

Publish these public HTTPS pages before store submission:

- `/live-scoreboard/privacy`
- `/live-scoreboard/terms`
- `/live-scoreboard/refunds`
- `/live-scoreboard/support`
- `/live-scoreboard/checkout/success`
- `/live-scoreboard/checkout/cancelled`

The privacy policy must disclose the random license identifier, purchase SKU, entitlement status, Stripe, Supabase, server logs, retention, deletion process, and customer rights. State clearly that the extension does not read browsing history or page content.

## Changes Required in the Extension

1. Replace the placeholder `startCheckout()` in `src/app.js` with a message to the service worker.
2. Add service-worker handlers for creating Checkout Sessions and refreshing entitlements.
3. Add the exact production API domain to `host_permissions`; do not use `<all_urls>`.
4. Create and persist the random license ID in `chrome.storage.sync`.
5. Replace seeded unlocked skins with server entitlements plus a local read-only cache.
6. Add `pending`, `paid`, `cancelled`, `offline`, `restore`, and `refunded` interface states.
7. For the five-pack, add a selection counter and server-backed credit redemption.
8. Add a Restore Purchases action.
9. Show this pre-checkout disclosure: `Secure checkout is provided by Stripe. Stripe collects your email and payment information. Live Scoreboard receives only purchase and entitlement status.`
10. Keep all Stripe UI and JavaScript on the hosted checkout page. Do not load Stripe.js or any remote script into the extension.

## Chrome Web Store Compliance Checklist

### Product and listing

- Keep the single purpose: live match scores, reminders, and presentation skins for that scoreboard.
- The live-score product must remain genuinely useful without buying a skin.
- Mark the item as containing in-app purchases in the Developer Dashboard.
- State all prices and the exact scope of each purchase before checkout.
- State `Unofficial. Not affiliated with or endorsed by FIFA or any football federation.`
- Do not use official tournament logos, trophy artwork, federation crests, kit designs, mascots, or copied screenshots.
- Cultural themes should remain abstract and original; avoid suggesting an official team license.

### Privacy and permissions

- Publish an accurate privacy policy and keep it synchronized with the dashboard disclosures.
- Declare payment/financial information as processed by Stripe, not collected by the extension itself.
- Disclose the persistent license identifier and entitlement data sent to your backend.
- Use HTTPS for every API call.
- Request only `sidePanel`, `storage`, `alarms`, and `notifications`, plus narrowly scoped score and licensing hosts.
- Do not collect browsing history, visited URLs, page content, or ad-targeting data.
- In the dashboard, declare that the extension uses no remote code.

### Manifest V3 and payment security

- Bundle all extension JavaScript locally.
- Remote APIs may return JSON data, never executable logic.
- Keep prices and fulfillment decisions on the server.
- Verify signed webhooks and make fulfillment idempotent.
- Never unlock based on a redirect URL, client flag, or editable Chrome storage alone.
- Do not store card data.

### Review evidence

- Submit precise permission justifications.
- Provide reviewer instructions for Live, Watchlist, Skins, purchase, restore, and refund states.
- Provide a server-created reviewer test license or test entitlement. Do not hardcode a universal bypass in the extension.
- Include a short screen recording showing checkout and automatic unlock.
- First publish privately to trusted testers, then submit the tested production build publicly.
- Google requires two-step verification for the developer account.

## Refunds, Disputes, and Support

- Publish a plain-language digital-goods refund policy before accepting money.
- Handle `charge.refunded` and `charge.dispute.created` events.
- Decide whether a refund revokes the skin immediately or after a short grace period; state that policy.
- Provide a support route for lost license IDs and purchase restoration.
- Keep transaction records required for accounting and tax compliance, while deleting unnecessary identifiers according to the privacy policy.

## Testing Gates

### Automated

- Checkout endpoint rejects unknown SKUs, skin IDs, and client-supplied prices.
- Webhook rejects invalid signatures.
- Duplicate webhooks never duplicate credits.
- Successful single-skin payment grants exactly one skin.
- Five-pack grants exactly five credits.
- Credit redemption cannot go below zero.
- All-access returns every packaged 2026 skin.
- Refund/dispute behavior matches policy.
- Entitlement API does not leak data between license IDs.

### Manual

- Successful card, declined card, 3D Secure, delayed payment, cancellation, and refresh.
- Checkout tab closed before return.
- Extension closed during payment and reopened afterward.
- Offline mode and backend outage.
- Purchase restoration on another Chrome profile using the approved restore method.
- Store reviewer flow using a temporary reviewer entitlement.

## Launch Sequence

1. Complete Stripe, banking, support domain, and policy pages.
2. Build database and server functions in Stripe test mode.
3. Integrate the extension and remove all seeded premium entitlements.
4. Pass automated tests and Stripe test scenarios.
5. Publish a private Chrome Web Store beta to trusted testers.
6. Run at least ten end-to-end test purchases and verify support/refund handling.
7. Switch the server to live Stripe keys without changing extension-side secrets.
8. Update the store listing: in-app purchases, privacy disclosures, permissions, support, and reviewer instructions.
9. Submit the production package for public review.
10. Monitor Stripe webhooks, failed checkouts, entitlement errors, refunds, reviews, and policy email.

## Revenue Metrics Without Browsing Surveillance

Measure only commerce and product events necessary to improve this feature:

- Skin store viewed
- Checkout started
- Checkout completed
- Checkout abandoned
- Skin applied
- Five-pack credits remaining
- Refund rate
- Support tickets per 100 purchases

Do not attach these events to browsing history, visited pages, page content, or advertising profiles.

## Recommended Conversion Design

- Keep core scores and reminders free.
- Let every locked skin be previewed before purchase.
- Make the five-pack the recommended offer with a truthful savings comparison.
- Show a permanent Owned state and an obvious Restore Purchases command.
- Show one purchase prompt only after a user actively opens Skins or previews a locked theme.
- Never interrupt live-score viewing with a purchase modal.
- Keep cultural artwork respectful, original, and child-friendly.

## Official Sources

- [Chrome Web Store payments deprecation](https://developer.chrome.com/docs/webstore/cws-payments-deprecation)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
- [Chrome Web Store privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Chrome Web Store distribution and in-app purchase declaration](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution)
- [Manifest V3 and remotely hosted code](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [Chrome developer registration](https://developer.chrome.com/docs/webstore/register)
- [Stripe Checkout Sessions](https://docs.stripe.com/payments/checkout-sessions)
- [Stripe fulfillment and signed webhooks](https://docs.stripe.com/checkout/fulfillment)
- [Stripe account activation](https://docs.stripe.com/get-started/account)
- [Stripe pricing](https://stripe.com/pricing)
- [Stripe Tax](https://docs.stripe.com/tax/faq)

