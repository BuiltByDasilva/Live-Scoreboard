# Live Scoreboard 1.0 Promo Media

Final video:

- `live-scoreboard-promo.mp4`
- 1920 x 1080
- 24 fps
- H.264 MP4

The 1.0 promo uses live browser captures from the redesigned extension so the Chrome Web Store media matches the actual installable build. Store images live in `store-listing-assets/`.

Encode MP4 on macOS after frames are generated:

```bash
env CLANG_MODULE_CACHE_PATH=/tmp/live-scoreboard-swift-cache /usr/bin/swift promo-video/encode_frames.swift promo-video/frames promo-video/live-scoreboard-promo.mp4 24 1920 1080
```
