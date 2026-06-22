# Compliance Notes

Live Scoreboard was built around Chrome Web Store review principles and intellectual-property caution.

## Chrome Web Store posture

- Single purpose: live tournament scoreboard, reminders, and directly related visual personalization.
- Manifest V3.
- Minimal permissions: `sidePanel`, `storage`, `alarms`, and `notifications`.
- One host permission limited to `https://site.api.espn.com/*` for factual scoreboard data.
- No content scripts.
- No page content reading.
- No search override, new tab override, ad injection, or browsing-data access.
- Settings are stored locally in Chrome storage.

## Monetization posture

Chrome Web Store payments are deprecated, so skin-pack monetization should use an external payment processor and a backend license service before launch. The MVP shows the purchase model and preview behavior but does not process real money.

## Intellectual-property posture

- App name: `Live Scoreboard`.
- No official federation logos, official tournament logos, mascot, trophy art, or jersey replicas.
- Team skins use original abstract patterns and culturally respectful design notes. Country colors are a starting point, not a reproduction of flags, uniforms, or protected team identity systems.
- Store listing should include an unofficial affiliation disclaimer.
- Country/team names and match facts are treated as factual references.

## Data posture

The development build reads factual scoreboard JSON from ESPN's public endpoint and bundles OpenFootball's public-domain schedule. No browsing activity or personal data is sent. Production launch still requires written commercial extension rights or a licensed replacement provider; the adapter was intentionally isolated to make that replacement small.
