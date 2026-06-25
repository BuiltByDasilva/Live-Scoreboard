# Compliance Notes

Live Scoreboard was built around Chrome Web Store review principles and intellectual-property caution.

## Chrome Web Store posture

- Single purpose: live tournament scoreboard, reminders, and directly related visual personalization.
- Manifest V3.
- Minimal permissions: `sidePanel`, `storage`, `alarms`, and `notifications`.
- Host permissions limited to `https://site.api.espn.com/*` for factual scoreboard data and `https://kmtpuvtswatkilvkffqb.supabase.co/*` for optional skin checkout, license redemption, and entitlement verification.
- No content scripts.
- No page content reading.
- No search override, new tab override, ad injection, or browsing-data access.
- Settings are stored locally in Chrome storage.

## Monetization posture

Live Scoreboard offers optional paid skins. Purchases are initiated from the extension, fulfilled through a backend license service, and paid through Stripe-hosted Checkout. The extension does not collect or store card numbers, payment credentials, billing addresses, or bank information.

The extension stores and transmits a random license identifier, selected SKU/skin ID, purchase status, and entitlement state so users can unlock and restore purchased skins. Stripe handles payment details on Stripe-hosted pages, and the backend verifies entitlements before unlocking paid skins.

## Intellectual-property posture

- App name: `Live Scoreboard`.
- No official federation logos, official tournament logos, mascot, trophy art, or jersey replicas.
- Team skins use original abstract patterns and culturally respectful design notes. Country colors are a starting point, not a reproduction of flags, uniforms, or protected team identity systems.
- Store listing should include an unofficial affiliation disclaimer.
- Country/team names and match facts are treated as factual references.

## Data posture

The extension reads factual scoreboard JSON from ESPN's public endpoint and stores user preferences in Chrome storage. No browsing activity, page content, cookies, passwords, form entries, or personal communications are read or sent.

For optional purchases, the extension sends a random license identifier and purchase/entitlement information to the backend licensing service. Payment details are handled by Stripe-hosted Checkout rather than by the extension.
