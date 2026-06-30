# Live Scoreboard Privacy Policy

Effective date: June 30, 2026

Live Scoreboard is a Chrome extension for viewing soccer scores, match reminders, pinned matches, bracket progress, language preferences, and visual themes. This policy explains what the extension stores, what it does not collect, and how its Chrome permissions are used.

## Data The Extension Stores

Live Scoreboard stores the following data locally in Chrome storage on your device:

- Watched match IDs.
- Pinned toolbar match ID.
- Selected language.
- Active scoreboard skin.
- Reminder timing preference.
- Last notification IDs, used to avoid duplicate reminder notifications.
- Cached score data, used so the extension can still show the last known safe scoreboard state during feed outages.

This data is used only to run the extension features you choose.

## Data The Extension Does Not Collect

Live Scoreboard does not collect, sell, share, or transmit:

- Browsing history.
- Web page content.
- Search history.
- Cookies.
- Passwords.
- Form entries.
- Emails, chats, or personal communications.
- Payment information.
- Precise location.
- User analytics or advertising identifiers.

The extension does not include ads, tracking pixels, remote analytics, checkout flows, subscriptions, or in-app purchases.

## Live Score Network Requests

Live Scoreboard requests factual soccer scoreboard and standings data from `https://site.api.espn.com/*` and `https://site.web.api.espn.com/*`. These requests are used to display live and upcoming match data, bracket progress, and elimination status inside the extension.

The extension does not attach your watched list, pinned match, selected skin, language setting, browsing activity, or personal data to these scoreboard requests. As with ordinary web requests, the score provider may receive standard technical request information such as IP address and user-agent according to that provider's own systems.

## Chrome Permissions

Live Scoreboard uses these Chrome extension permissions:

- `sidePanel`: opens the scoreboard in Chrome's side panel.
- `storage`: saves preferences, watched match IDs, pinned match ID, reminder settings, language, skin, and cached score data locally.
- `alarms`: refreshes score data and checks reminder timing in the background.
- `notifications`: shows optional match reminder notifications.
- Host permission for `https://site.api.espn.com/*`: fetches scoreboard data.
- Host permission for `https://site.web.api.espn.com/*`: fetches standings data for bracket and elimination updates.

Live Scoreboard does not use content scripts and does not request permission to read or change websites you visit.

## Data Sharing

Live Scoreboard does not sell data, transfer user data to advertisers, or share user data with third parties. The only network activity initiated by the extension is the scoreboard and standings data request described above.

## Data Retention And Deletion

Stored preferences remain in Chrome storage until you change them, clear extension data, or uninstall the extension. Uninstalling the extension removes its locally stored extension data through Chrome's normal extension removal behavior.

## Children

Live Scoreboard is a general-audience sports utility and does not knowingly collect personal information from children.

## Changes

If this privacy policy changes, the updated version should be published with a new effective date.

## Contact

For privacy questions, contact the publisher through the Chrome Web Store support contact listed for Live Scoreboard or through the public GitHub repository for this project.
