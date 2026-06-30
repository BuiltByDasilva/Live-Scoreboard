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

Free live soccer scores, pinned match focus, World Cup bracket tracking, language support, and artistic country skins.

## Full Description

Live Scoreboard turns Chrome's side panel into a free, colorful match day companion for soccer fans.

Open the side panel to follow live and upcoming games, pin a match so the score stays easy to find, build a watchlist, switch between classic and futuristic scoreboard styles, explore country inspired skins, and follow the World Cup knockout bracket as the tournament moves from one round to the next.

This extension is designed for fans who want the tournament nearby without opening another crowded website. It keeps the experience focused, fast, and easy to understand: live score first, next match second, bracket progress close behind.

Why fans may love it:

- Free to use.
- Live soccer scoreboard inside Chrome's side panel.
- Pinned match focus for the game you care about most.
- Toolbar soccer ball icon built to make the extension easy to recognize.
- Watchlist controls for games you want to follow.
- Optional reminder notifications.
- Interactive World Cup bracket tab.
- Remaining knockout games shown in a scrollable bracket view.
- Eliminated teams remembrance section.
- Futuristic neon scoreboard style.
- Classic matchday scoreboard style.
- Country inspired visual skins with flags and artistic landmark energy.
- Five app languages: English, Spanish, Portuguese Brazil, Arabic, and French.
- Local preferences saved in Chrome storage.
- No ads.
- No subscriptions.
- No payment flow.
- No content scripts.
- No reading or changing websites you visit.

Version 2.0.0 is the biggest update so far. The app now has a four tab layout for Live, Watch, Bracket, and Skins. The Live tab focuses on current, live, and upcoming matches so finished old games do not clutter the view. The Bracket tab gives fans a reason to return throughout the tournament. The Skins tab lets users make the app feel more personal, with visual styles created to celebrate countries in a respectful and original way.

Language support matters because the World Cup is global. English, Spanish, Portuguese Brazil, Arabic, and French make the app more welcoming for fans across different regions and communities. A scoreboard should feel easy to read, and fans should not have to fight the interface just to enjoy the match.

Live Scoreboard is an unofficial fan utility. It is not affiliated with, endorsed by, sponsored by, or officially connected to FIFA, tournament organizers, governing bodies, teams, federations, broadcasters, or sponsors. Country and team names are used only for factual match identification. Visual themes are original artwork and do not include official crests, jerseys, tournament logos, mascots, trophy artwork, or protected marks.

## What's New In 2.0.0

- Added a Bracket tab that stays on the same row as Live, Watch, and Skins.
- Added a horizontally scrollable knockout bracket.
- Added eliminated teams remembrance section.
- Improved the Live tab so stale old games are removed from view.
- Kept recent completed games only briefly so users can see fresh final scores without clutter.
- Added stronger country skin visuals with flags and landmark inspired scenes.
- Added classic and futuristic scoreboard style skins.
- Improved tab legibility in narrow Chrome side panel widths.
- Rebuilt the toolbar and store icon around a recognizable soccer ball.
- Added generated whistle alerts for match start, goals, and full time.
- Refreshed screenshots, localized screenshots, promo tiles, and promo video.
- Updated package metadata to version `2.0.0`.
- Added open source release documents, privacy policy, and compliance notes.

## Privacy Summary

Live Scoreboard stores preferences locally in Chrome storage, including watched match IDs, selected language, active skin, pinned match ID, reminder timing, notification IDs, and cached score data.

Live Scoreboard does not collect, sell, or share personal information. It does not read browsing history, page content, cookies, passwords, form entries, emails, payment data, or personal communications.

Network access is limited to public scoreboard and standings data from ESPN endpoints. The extension does not attach user preferences, browsing activity, or page content to those scoreboard requests.

## Permission Summary

- `sidePanel`: opens the scoreboard panel.
- `storage`: saves preferences and cached score data locally.
- `alarms`: refreshes scores and checks reminder timing.
- `notifications`: displays optional match reminder notifications.
- `https://site.api.espn.com/*`: fetches scoreboard data.
- `https://site.web.api.espn.com/*`: fetches standings data for bracket and elimination updates.

## Store Assets

- Store icon: `store-assets/icon/store-icon-128.png`
- Screenshot 1: `store-assets/screenshots-global/01-live-scoreboard-2-0.png`
- Screenshot 2: `store-assets/screenshots-global/02-pinned-watchlist-2-0.png`
- Screenshot 3: `store-assets/screenshots-global/03-world-cup-bracket-2-0.png`
- Screenshot 4: `store-assets/screenshots-global/04-country-skins-2-0.png`
- Screenshot 5: `store-assets/screenshots-global/05-global-language-2-0.png`
- Small promo tile: `store-assets/promo-tiles/small-promo-tile-440x280.jpg`
- Marquee promo tile: `store-assets/promo-tiles/marquee-promo-1400x560.jpg`
- Promo video file: `video/live-scoreboard-promo.mp4`

## Localized Store Screenshots

- English: `store-assets/screenshots-localized/en-live-scoreboard-2-0.png`
- Spanish: `store-assets/screenshots-localized/es-live-scoreboard-2-0.png`
- Portuguese Brazil: `store-assets/screenshots-localized/pt_BR-live-scoreboard-2-0.png`
- French: `store-assets/screenshots-localized/fr-live-scoreboard-2-0.png`
- Arabic: `store-assets/screenshots-localized/ar-live-scoreboard-2-0.png`

## Chrome Web Store Dashboard Notes

- Upload `chrome-web-store-upload/live-scoreboard-extension.zip` as the extension package.
- Publish `PRIVACY_POLICY.md` at a public URL before submitting.
- Upload the five global screenshots.
- Upload localized screenshots for each supported locale.
- Upload `store-icon-128.png`, `small-promo-tile-440x280.jpg`, and `marquee-promo-1400x560.jpg`.
- Chrome Web Store promotional video fields generally use a YouTube URL, so upload `video/live-scoreboard-promo.mp4` to YouTube first, then paste the YouTube URL.
- Confirm the privacy questionnaire matches `CHROME_WEB_STORE_PRIVACY_DISCLOSURE.md`.
- Confirm the listing keeps the unofficial fan utility disclaimer.

## Pre Upload Checklist

1. Run validation.
2. Upload the extension ZIP.
3. Confirm Chrome Web Store reads version `2.0.0`.
4. Paste the short description.
5. Paste the full description.
6. Add the public privacy policy URL.
7. Upload screenshots and promo graphics.
8. Add the YouTube promo video URL after upload.
9. Confirm permission justifications.
10. Submit for review.
