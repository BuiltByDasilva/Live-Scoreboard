# Live Scoreboard

Live Scoreboard is an original Chrome Manifest V3 extension for glanceable football scores. It keeps the selected live score visible on the Chrome toolbar, opens a detailed side panel, supports upcoming-match reminders, and includes original country-inspired skins for all 48 teams.

This MVP intentionally avoids official logos, official event marks, team federation crests, jersey replicas, copied store text, copied screenshots, and any claim of official affiliation.

## What is included

- Chrome side panel scoreboard
- Toolbar badge showing a pinned live score without opening the extension
- `GOAL`, live score, halftime/full-time, and kickoff-soon badge states
- Complete 104-match schedule with live data refreshed every 30 seconds
- Last-known-good caching and a bundled public-domain offline schedule
- Watchlist buttons for upcoming games
- Background reminder checks for watched upcoming games
- Local Chrome storage for settings
- 48 original country-inspired skins with unique motifs, patterns, palettes, and cultural design notes
- Skin search, owned/locked filters, active-theme preview, and `$0.99` / `$2.99` / `$9.99` purchase surfaces
- No page-reading permissions; one narrowly scoped host permission for the live scoreboard feed

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

## Before marketplace launch

The development build uses ESPN's public scoreboard JSON as its live source and a bundled copy of OpenFootball's public-domain 2026 dataset for the complete schedule and outage fallback. It does not send browsing data, page content, or personal information to either source.

Before marketplace publication, obtain written commercial-use approval for the live feed or switch the provider adapter in `src/live-data.js` to a licensed source. The public scoreboard endpoint is excellent for immediate product testing but is undocumented and should not be treated as a permanent commercial contract.

Recommended production additions:

- Licensed live-score API via the existing provider adapter and a small backend proxy so API keys are not exposed in the extension.
- Stripe Checkout or Stripe Payment Links for skin-pack purchases.
- Server-side license records for purchased skin packs.
- Store screenshots, 1280x800 promotional imagery, privacy policy, support URL, and test instructions.
- Broader QA in Chrome stable, Edge, and at narrow side-panel widths.

## Theme art direction

Each premium skin is an original visual system rather than a recolor. Themes use abstract cultural inspiration such as paper craft, landscape, tile geometry, weaving, gardens, music, and waterways. They do not include official federation crests, tournament marks, trophy artwork, kit replicas, copyrighted mascots, or claims of endorsement.

The checkout controls currently emit a secure checkout handoff event and clearly state that no charge was made. Stripe URLs and the entitlement service must be connected before real payments are enabled.
