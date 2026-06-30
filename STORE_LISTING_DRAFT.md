# Chrome Web Store Listing Draft

## Product

Live Scoreboard

## Release Package

- Upload ZIP: `live-scoreboard-extension.zip`
- Version: `2.0.0`
- Extension ID: `onjkngifgfenladcdnoinkfeaiadkmpf`
- Default locale: English (`en`)
- Locales included: English (`en`), Spanish (`es`), Portuguese Brazil (`pt_BR`), Arabic (`ar`), French (`fr`)
- Hosted privacy policy: publish `PRIVACY_POLICY.md` online and paste that public URL into the Chrome Web Store privacy policy field.
- Store privacy questionnaire reference: `CHROME_WEB_STORE_PRIVACY_DISCLOSURE.md`

## Short Description

Live football scores, pinned match focus, World Cup bracket tracking, language support, and artistic country skins.

## Full Description

Live Scoreboard turns Chrome's side panel into a bold match-day companion for international football.

Follow live and upcoming matches in a vibrant Miami-neon scoreboard, pin a game to keep the score visible from Chrome's toolbar, track watched matches, switch between classic and futuristic scoreboard styles, and explore country-inspired skins built to celebrate the global game.

Version 2.0.0 adds an interactive World Cup bracket tab so fans can follow the knockout path, future rounds, and eliminations throughout the tournament. The app also includes a remembrance-style eliminated teams section, refreshed toolbar soccer-ball icon, cleaner four-tab navigation, stronger country-skin visuals, and polished Chrome Web Store assets.

Built for match day:

- Live football scoreboard side panel.
- Pinned match focus with toolbar score badge.
- Interactive World Cup knockout bracket.
- Eliminated teams remembrance section.
- Watchlist and reminder controls.
- Futuristic neon scoreboard style.
- Classic matchday print scoreboard style.
- Country-inspired skins with original artwork and flag previews.
- English, Spanish, Portuguese, Arabic, and French language support.
- Local Chrome storage for preferences.
- No page-reading permissions and no content scripts.

Live Scoreboard is an unofficial fan utility. It is not affiliated with, endorsed by, sponsored by, or officially connected to FIFA, tournament organizers, governing bodies, teams, federations, broadcasters, or sponsors. Country and team names are used only for factual match identification. Visual themes are original artwork and do not include official crests, jerseys, tournament logos, mascots, trophy artwork, or protected marks.

## What's New In 2.0.0

- Added a fourth Bracket tab that stays on one row with Live, Watch, and Skins.
- Added horizontally scrollable World Cup knockout bracket tracking.
- Added eliminated-team remembrance section.
- Updated country-skin hero visuals so each skin has stronger national landmark identity.
- Added classic and futuristic scoreboard styles as toggleable scoreboard skins.
- Improved tab legibility in narrow side panel widths.
- Rebuilt the Chrome toolbar icon as a recognizable soccer ball.
- Refreshed Chrome Web Store screenshots, promo tiles, localized screenshots, and promo video.
- Updated package metadata to version `2.0.0`.
- Added open-source MIT license and privacy policy.

## Privacy Summary

Live Scoreboard stores preferences locally in Chrome storage, including watched match IDs, selected language, active skin, pinned match ID, reminder timing, and cached score data. It does not read browsing history, page content, cookies, passwords, form entries, emails, payment data, or personal communications.

Network access is limited to scoreboard data from `https://site.api.espn.com/*`. The extension does not attach user preferences or browsing activity to those requests.

## Permission Summary

- `sidePanel`: opens the scoreboard panel.
- `storage`: saves preferences and cached score data locally.
- `alarms`: refreshes scores and reminder checks.
- `notifications`: displays optional match reminder notifications.
- `https://site.api.espn.com/*`: fetches factual scoreboard data.

## Store Assets

- Store icon: `promo-video/store-listing-assets/store-icon-128.png`
- Screenshot 1: `promo-video/store-listing-assets/01-live-scoreboard-2-0.png`
- Screenshot 2: `promo-video/store-listing-assets/02-pinned-watchlist-2-0.png`
- Screenshot 3: `promo-video/store-listing-assets/03-world-cup-bracket-2-0.png`
- Screenshot 4: `promo-video/store-listing-assets/04-country-skins-2-0.png`
- Screenshot 5: `promo-video/store-listing-assets/05-global-language-2-0.png`
- Small promo tile: `promo-video/store-listing-assets/small-promo-tile-440x280.png`
- Marquee promo tile: `promo-video/store-listing-assets/marquee-promo-1400x560.png`
- Promo video file: `promo-video/live-scoreboard-promo.mp4`

## Localized Store Screenshots

- English: `promo-video/store-listing-assets/localized/en-live-scoreboard-2-0.png`
- Spanish: `promo-video/store-listing-assets/localized/es-live-scoreboard-2-0.png`
- Portuguese Brazil: `promo-video/store-listing-assets/localized/pt_BR-live-scoreboard-2-0.png`
- French: `promo-video/store-listing-assets/localized/fr-live-scoreboard-2-0.png`
- Arabic: `promo-video/store-listing-assets/localized/ar-live-scoreboard-2-0.png`

Actual app-language source captures are also in `promo-video/store-listing-assets/localized/source-*-app-2-0-440x760.png`.

## Dashboard Notes

- Chrome Web Store accepts YouTube URLs for promotional video uploads. Upload `promo-video/live-scoreboard-promo.mp4` to YouTube first, then paste the YouTube URL in the store listing.
- Keep the privacy policy URL public and accessible without sign-in.
- Confirm the data-use/privacy questionnaire matches `PRIVACY_POLICY.md`.
- Confirm the host permission disclosure mentions scoreboard data only.

## Pre-Upload Checks

1. Run `npm run validate`.
2. Run `npm test`.
3. Run `npm run package`.
4. Upload `live-scoreboard-extension.zip`.
5. Confirm Chrome Web Store reads version `2.0.0`.
6. Upload the five global screenshots.
7. Upload localized screenshots for each supported locale.
8. Upload `store-icon-128.png`, `small-promo-tile-440x280.png`, and `marquee-promo-1400x560.png`.
9. Add the YouTube promo video URL after uploading the MP4.
10. Submit for review only after package, listing, privacy, screenshots, and permissions all match.
