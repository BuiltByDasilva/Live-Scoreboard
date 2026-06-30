# Live Scoreboard

Live Scoreboard is an original Chrome Manifest V3 extension for glanceable soccer scores. It keeps the selected live score visible on the Chrome toolbar, opens a detailed side panel, supports upcoming-match reminders, tracks the World Cup knockout bracket, and includes original country-inspired skins for all 48 teams.

This MVP intentionally avoids official logos, official event marks, team federation crests, jersey replicas, copied store text, copied screenshots, and any claim of official affiliation.

## What is included

- Chrome side panel scoreboard
- Toolbar badge showing a pinned live score without opening the extension
- `GOAL`, live score, halftime/full-time, and kickoff-soon badge states
- Complete 104-match schedule with live data refreshed every 30 seconds
- Last-known-good caching and a bundled public-domain offline schedule
- Watchlist buttons for upcoming games
- Interactive knockout bracket tab with horizontally scrollable rounds
- Eliminated-team remembrance section
- Background reminder checks for watched upcoming games
- Local Chrome storage for settings
- Classic matchday print and futuristic neon scoreboard skins
- 48 original country-inspired skins with unique motifs, patterns, palettes, and cultural design notes
- Skin search, active-theme preview, and open themes for all users
- No page-reading permissions; host permissions only for the live scoreboard feed

## Load locally

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Choose `Load unpacked`.
4. Select this folder: `/Users/nicholasdasilva/Documents/Scoreboard`.
5. Click the Live Scoreboard toolbar icon to open the side panel.

## Validate

Run:

```bash
npm run validate
```

If npm is not available, run the validator directly with Node:

```bash
node scripts/validate.mjs
```

## Production notes

The development build uses ESPN's public scoreboard JSON as its live source and a bundled copy of OpenFootball's public-domain 2026 dataset for the complete schedule and outage fallback. It does not send browsing data, page content, or personal information to either source.

For long-term production use, obtain written commercial-use approval for the live feed or switch the provider adapter in `src/live-data.js` to a licensed source. The public scoreboard endpoint is excellent for immediate product testing but is undocumented and should not be treated as a permanent commercial contract.

Recommended follow-ups:

- Licensed live-score API via the existing provider adapter and a small backend proxy so API keys are not exposed in the extension.
- Broader QA in Chrome stable, Edge, and at narrow side-panel widths.

## Theme art direction

Each theme is an original visual system rather than a recolor. Skins use abstract cultural inspiration such as paper craft, landscape, tile geometry, weaving, gardens, music, and waterways. They do not include official federation crests, tournament marks, trophy artwork, kit replicas, copyrighted mascots, or claims of endorsement.

There is no paid flow in this release. All themes are available for free and apply directly from the Skins tab.

## 2.0.0 release assets

Release copy lives in `STORE_LISTING_DRAFT.md`.

Privacy copy lives in `PRIVACY_POLICY.md`.

Chrome Web Store media lives in `promo-video/store-listing-assets/`, including the 128x128 store icon, five global 1280x800 screenshots, localized screenshots, the 440x280 small promo tile, the 1400x560 marquee tile, and the generated promo video source.
