# Chrome Web Store Privacy Disclosure

Use this as the Chrome Web Store privacy/data-use questionnaire reference for Live Scoreboard 2.0.0.

## Public Privacy Policy URL

Publish `PRIVACY_POLICY.md` on your public website or GitHub Pages and use that public URL in the Chrome Web Store dashboard.

## Single Purpose

Live Scoreboard provides live soccer scores, pinned match status, watchlist reminders, bracket tracking, language preferences, and visual scoreboard skins in Chrome's side panel and toolbar.

## Data Collected

The extension does not collect personally identifiable information, health information, financial/payment information, authentication information, personal communications, location, web history, user activity, or website content.

## Data Stored Locally

The extension stores these local preferences in Chrome storage:

- Watched match IDs.
- Pinned match ID.
- Selected language.
- Active skin.
- Reminder timing.
- Last notification IDs.
- Cached score data for fallback display.

This local data is used only for extension functionality.

## Data Shared Or Sold

No user data is sold, transferred, or shared for advertising, analytics, credit, profiling, or unrelated purposes.

## Remote Requests

The extension requests factual scoreboard and standings data from `https://site.api.espn.com/*` and `https://site.web.api.espn.com/*`. User preferences, browsing activity, page content, and personal data are not attached to these requests by the extension.

## Permissions Justification

- `sidePanel`: opens the scoreboard UI.
- `storage`: saves extension preferences and cached score data locally.
- `alarms`: runs score refresh and reminder checks.
- `notifications`: shows optional match reminder notifications.
- `https://site.api.espn.com/*`: fetches scoreboard data.
- `https://site.web.api.espn.com/*`: fetches standings data for bracket and elimination updates.

## Content Scripts

Live Scoreboard does not use content scripts and does not read or modify websites the user visits.

## Store Listing Disclaimer

Live Scoreboard is an unofficial fan utility and is not affiliated with, endorsed by, sponsored by, or officially connected to FIFA, tournament organizers, governing bodies, teams, federations, broadcasters, or sponsors.
