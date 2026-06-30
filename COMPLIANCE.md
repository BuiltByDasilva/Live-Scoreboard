# Compliance Notes

Live Scoreboard was built around Chrome Web Store review principles and intellectual-property caution.

## Chrome Web Store posture

- Single purpose: live tournament scoreboard, bracket tracking, reminders, and directly related visual personalization.
- Manifest V3.
- Minimal permissions: `sidePanel`, `storage`, `alarms`, and `notifications`.
- Host permissions limited to ESPN scoreboard and standings endpoints for factual match and bracket data.
- No content scripts.
- No page content reading.
- No search override, new tab override, ad injection, or browsing-data access.
- Settings are stored locally in Chrome storage.
- Privacy policy for the 2.0.0 listing is in `PRIVACY_POLICY.md`.

## Monetization posture

The app is completely free for this release. There is no checkout, subscription, or in-app purchase flow.

## Intellectual-property posture

- App name: `Live Scoreboard`.
- No official federation logos, official tournament logos, mascot, trophy art, or jersey replicas.
- Team skins use original abstract patterns and culturally respectful design notes. Country colors are a starting point, not a reproduction of flags, uniforms, or protected team identity systems.
- Store listing should include an unofficial affiliation disclaimer.
- Country/team names and match facts are treated as factual references.

## Data posture

The extension reads factual scoreboard and standings JSON from ESPN's public endpoints and stores user preferences in Chrome storage. No browsing activity, page content, cookies, passwords, form entries, or personal communications are read or sent.

No payment or license data is collected. All themes are available immediately from app settings.

## Open-source posture

The 2.0.0 release includes an MIT license in `LICENSE`. Before publishing the GitHub repository, confirm that any future live-score provider terms, store graphics, and generated media are compatible with the open-source release.
