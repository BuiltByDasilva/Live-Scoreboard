# Live Scoreboard 2.0.0 Release Checklist

## Release Scope

- Version bumped to `2.0.0` in `manifest.json` and `package.json`.
- Bracket tab added to the side panel.
- Country and scoreboard skins refreshed.
- Toolbar/store icon rebuilt as a soccer ball.
- Chrome Web Store listing draft refreshed.
- Privacy policy added.
- Chrome Web Store privacy disclosure added.
- MIT license added for open-source release.
- Store media regenerated.

## Validation Commands

```bash
npm run validate
npm test
npm run media
npm run package
```

## Package

Upload this file to the Chrome Web Store package section:

```text
live-scoreboard-extension.zip
```

## Store Listing Assets

- Store icon: `promo-video/store-listing-assets/store-icon-128.png`
- Global screenshots:
  - `promo-video/store-listing-assets/01-live-scoreboard-2-0.png`
  - `promo-video/store-listing-assets/02-pinned-watchlist-2-0.png`
  - `promo-video/store-listing-assets/03-world-cup-bracket-2-0.png`
  - `promo-video/store-listing-assets/04-country-skins-2-0.png`
  - `promo-video/store-listing-assets/05-global-language-2-0.png`
- Localized screenshots: `promo-video/store-listing-assets/localized/*-live-scoreboard-2-0.png`
- Small promo tile: `promo-video/store-listing-assets/small-promo-tile-440x280.png`
- Marquee promo tile: `promo-video/store-listing-assets/marquee-promo-1400x560.png`
- Promo video: `promo-video/live-scoreboard-promo.mp4`

## Before Publishing

1. Publish `PRIVACY_POLICY.md` at a public URL.
2. Upload the promo video to YouTube and paste the YouTube URL into the Chrome Web Store dashboard.
3. Confirm the Chrome Web Store privacy/data-use questionnaire matches `CHROME_WEB_STORE_PRIVACY_DISCLOSURE.md` and `PRIVACY_POLICY.md`.
4. Confirm screenshots and copy do not claim official tournament affiliation.
5. Confirm the GitHub repository includes `LICENSE`, `README.md`, `COMPLIANCE.md`, `PRIVACY_POLICY.md`, and this checklist.
