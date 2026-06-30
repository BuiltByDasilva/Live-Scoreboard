# Live Scoreboard 2.0 Promo Media

Generated video:

- `live-scoreboard-promo.mp4`
- 1920 x 1080
- 24 fps
- H.264 MP4

Store listing assets:

- Global screenshots: `store-listing-assets/*-2-0.png`
- Localized listing screenshots: `store-listing-assets/localized/*-live-scoreboard-2-0.png`
- Actual localized app captures: `store-listing-assets/localized/source-*-app-2-0-440x760.png`
- Store icon: `store-listing-assets/store-icon-128.png`
- Small promo tile: `store-listing-assets/small-promo-tile-440x280.png`
- Marquee promo tile: `store-listing-assets/marquee-promo-1400x560.png`

The 2.0 promo uses live browser captures from the extension so the Chrome Web Store media matches the installable build. Regenerate after changing screenshots or source images:

```bash
npm run media
```

Encode MP4 directly on macOS if needed:

```bash
env CLANG_MODULE_CACHE_PATH=/tmp/live-scoreboard-swift-cache /usr/bin/swift promo-video/encode_frames.swift promo-video/frames promo-video/live-scoreboard-promo.mp4 24 1920 1080
```
