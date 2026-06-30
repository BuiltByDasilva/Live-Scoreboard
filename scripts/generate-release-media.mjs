import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const mediaDir = join(root, "promo-video");
const storeDir = join(mediaDir, "store-listing-assets");
const framesDir = join(mediaDir, "frames");
const swiftCache = "/tmp/live-scoreboard-swift-cache";

const sources = {
  live: "source-extension-live-2-0-440x760.png",
  watchlist: "source-extension-watchlist-2-0-440x760.png",
  bracket: "source-extension-bracket-2-0-440x760.png",
  skins: "source-extension-skins-2-0-440x760.png",
  language: "source-extension-language-2-0-440x760.png",
  mobile: "source-extension-mobile-2-0-320x720.png",
};

const storeSlides = [
  {
    file: "01-live-scoreboard-2-0.png",
    title: "Live Scoreboard 2.0",
    subtitle: "Miami-neon football scores for Chrome.",
    source: sources.live,
    accent: "#00eaff",
  },
  {
    file: "02-pinned-watchlist-2-0.png",
    title: "Pinned Match Focus",
    subtitle: "Pin a match and keep the toolbar score alive.",
    source: sources.watchlist,
    accent: "#ff4fa3",
  },
  {
    file: "03-world-cup-bracket-2-0.png",
    title: "Interactive Bracket",
    subtitle: "Follow every knockout path and elimination.",
    source: sources.bracket,
    accent: "#ffd166",
  },
  {
    file: "04-country-skins-2-0.png",
    title: "Classic + Futuristic Skins",
    subtitle: "Country pride with artistic theme switching.",
    source: sources.skins,
    accent: "#aee016",
  },
  {
    file: "05-global-language-2-0.png",
    title: "Global Match Day",
    subtitle: "English, Spanish, Portuguese, Arabic, and French.",
    source: sources.language,
    accent: "#00eaff",
  },
];

const videoSlides = [
  {
    title: "Live Scoreboard 2.0",
    subtitle: "Miami-neon live scores for Chrome.",
    source: sources.live,
    accent: "#00eaff",
  },
  {
    title: "Pin the game.",
    subtitle: "The toolbar ball shows live score status while you browse.",
    source: sources.watchlist,
    accent: "#ff4fa3",
  },
  {
    title: "Follow the bracket.",
    subtitle: "Knockout rounds, advancement paths, and a remembrance section.",
    source: sources.bracket,
    accent: "#ffd166",
  },
  {
    title: "Choose your scoreboard.",
    subtitle: "Classic matchday print or futuristic neon, plus country skins.",
    source: sources.skins,
    accent: "#aee016",
  },
];

const localizedSlides = [
  {
    locale: "en",
    title: "Live Scoreboard 2.0",
    subtitle: "Live scores, bracket tracking, country skins, and pinned match focus.",
    accent: "#00eaff",
  },
  {
    locale: "es",
    title: "Marcador en Vivo 2.0",
    subtitle: "Resultados, llaves, temas de paises y partido fijado.",
    accent: "#ffd166",
  },
  {
    locale: "pt_BR",
    title: "Placar Ao Vivo 2.0",
    subtitle: "Resultados, chaveamento, temas de paises e jogo fixado.",
    accent: "#aee016",
  },
  {
    locale: "fr",
    title: "Scores en Direct 2.0",
    subtitle: "Scores, tableau, themes de pays et match epingle.",
    accent: "#00eaff",
  },
  {
    locale: "ar",
    title: "لوحة النتائج 2.0",
    subtitle: "نتائج مباشرة ومسار البطولة وسمات البلدان ومباراة مثبتة.",
    accent: "#ff4fa3",
  },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function dataUri(file) {
  const bytes = await readFile(join(storeDir, file));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

function posterSvg({ width, height, title, subtitle, imageData, accent, compact = false }) {
  const panelW = compact ? 170 : 392;
  const panelH = compact ? 294 : 678;
  const panelX = compact ? width - panelW - 18 : width - panelW - 96;
  const panelY = compact ? -8 : 62;
  const titleSize = compact ? 28 : 64;
  const subSize = compact ? 13 : 28;
  const textX = compact ? 26 : 92;
  const textY = compact ? 58 : 138;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <clipPath id="panelClip"><rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="18"/></clipPath>
  </defs>
  <rect width="${width}" height="${height}" fill="#031b2b"/>
  <rect width="${width}" height="${height}" fill="#f7e9bd" opacity="0.06"/>
  <circle cx="${width * 0.74}" cy="${height * 0.24}" r="${Math.min(width, height) * 0.28}" fill="${accent}" opacity="0.18" filter="url(#glow)"/>
  <path d="M0 ${height * 0.72} C ${width * 0.26} ${height * 0.52}, ${width * 0.52} ${height * 0.88}, ${width} ${height * 0.64}" fill="none" stroke="#00eaff" stroke-width="${compact ? 3 : 8}" opacity="0.72"/>
  <path d="M0 ${height * 0.82} C ${width * 0.32} ${height * 0.68}, ${width * 0.58} ${height * 0.96}, ${width} ${height * 0.75}" fill="none" stroke="#aee016" stroke-width="${compact ? 2 : 5}" opacity="0.64"/>
  <rect x="${compact ? 14 : 46}" y="${compact ? 14 : 38}" width="${width - (compact ? 28 : 92)}" height="${height - (compact ? 28 : 76)}" rx="${compact ? 16 : 28}" fill="none" stroke="#f7e9bd" stroke-width="${compact ? 2 : 4}" opacity="0.8"/>
  <text x="${textX}" y="${textY}" font-family="Avenir Next Condensed, Arial Narrow, Arial, sans-serif" font-size="${titleSize}" font-weight="900" fill="#fff7d3" letter-spacing="${compact ? 1 : 3}">${escapeXml(title)}</text>
  <text x="${textX}" y="${textY + titleSize * 0.86}" font-family="Avenir Next, Arial, sans-serif" font-size="${subSize}" font-weight="700" fill="#f7e9bd" opacity="0.86">${escapeXml(subtitle)}</text>
  <text x="${textX}" y="${height - (compact ? 36 : 88)}" font-family="Avenir Next Condensed, Arial Narrow, Arial, sans-serif" font-size="${compact ? 18 : 34}" font-weight="900" fill="${accent}" letter-spacing="${compact ? 2 : 5}">LIVE SCOREBOARD</text>
  <rect x="${panelX - (compact ? 5 : 14)}" y="${panelY - (compact ? 5 : 14)}" width="${panelW + (compact ? 10 : 28)}" height="${panelH + (compact ? 10 : 28)}" rx="${compact ? 20 : 30}" fill="#061a24" stroke="${accent}" stroke-width="${compact ? 3 : 5}" filter="url(#glow)"/>
  <image href="${imageData}" x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#panelClip)"/>
</svg>`;
}

async function svgToPng(svg, outPath) {
  const tempSvg = `${outPath}.svg`;
  await rm(outPath, { force: true });
  await writeFile(tempSvg, svg);
  try {
    await execFileAsync("sips", ["-s", "format", "png", tempSvg, "--out", outPath]);
  } finally {
    await rm(tempSvg, { force: true });
  }
}

async function generateStoreImages() {
  for (const slide of storeSlides) {
    const imageData = await dataUri(slide.source);
    const svg = posterSvg({ width: 1280, height: 800, imageData, ...slide });
    await svgToPng(svg, join(storeDir, slide.file));
  }

  const localizedDir = join(storeDir, "localized");
  await mkdir(localizedDir, { recursive: true });

  for (const slide of localizedSlides) {
    const imageData = await dataUri(sources.live);
    const svg = posterSvg({ width: 1280, height: 800, imageData, ...slide });
    await svgToPng(svg, join(localizedDir, `${slide.locale}-live-scoreboard-2-0.png`));
  }

  await svgToPng(posterSvg({
    width: 1400,
    height: 560,
    title: "Live Scoreboard 2.0",
    subtitle: "Live scores, bracket tracking, country skins, and pinned match focus.",
    imageData: await dataUri(sources.live),
    accent: "#00eaff",
  }), join(storeDir, "marquee-promo-1400x560.png"));

  await svgToPng(posterSvg({
    width: 440,
    height: 280,
    title: "Live Scoreboard",
    subtitle: "Scores + bracket",
    imageData: await dataUri(sources.live),
    accent: "#00eaff",
    compact: true,
  }), join(storeDir, "small-promo-tile-440x280.png"));

  await copyFile(join(root, "assets", "icon128.png"), join(storeDir, "store-icon-128.png"));
}

async function generateVideo() {
  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });
  await mkdir(swiftCache, { recursive: true });

  const keyframes = [];
  for (let index = 0; index < videoSlides.length; index += 1) {
    const slide = videoSlides[index];
    const imageData = await dataUri(slide.source);
    const keyframe = join(mediaDir, `video-slide-${String(index + 1).padStart(2, "0")}.png`);
    await svgToPng(posterSvg({ width: 1920, height: 1080, imageData, ...slide }), keyframe);
    keyframes.push(keyframe);
  }

  let frameIndex = 0;
  for (const keyframe of keyframes) {
    for (let repeat = 0; repeat < 72; repeat += 1) {
      const target = join(framesDir, `frame_${String(frameIndex).padStart(5, "0")}.png`);
      await copyFile(keyframe, target);
      frameIndex += 1;
    }
  }

  await execFileAsync("/usr/bin/swift", [
    join(mediaDir, "encode_frames.swift"),
    framesDir,
    join(mediaDir, "live-scoreboard-promo.mp4"),
    "24",
    "1920",
    "1080",
  ], {
    env: { ...process.env, CLANG_MODULE_CACHE_PATH: swiftCache },
    maxBuffer: 1024 * 1024 * 8,
  });

  await Promise.all(keyframes.map((file) => rm(file, { force: true })));
  await rm(framesDir, { recursive: true, force: true });
}

await mkdir(storeDir, { recursive: true });
await generateStoreImages();
await generateVideo();

console.log(`Generated store media in ${storeDir}`);
console.log(`Generated ${basename(join(mediaDir, "live-scoreboard-promo.mp4"))}`);
