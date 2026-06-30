import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "manifest.json",
  "LICENSE",
  "CHROME_WEB_STORE_PRIVACY_DISCLOSURE.md",
  "PRIVACY_POLICY.md",
  "RELEASE_2.0.0.md",
  "STORE_LISTING_DRAFT.md",
  "_locales/en/messages.json",
  "_locales/es/messages.json",
  "_locales/pt_BR/messages.json",
  "_locales/ar/messages.json",
  "_locales/fr/messages.json",
  "assets/data/worldcup-2026.json",
  "assets/soccer-ball.svg",
  "assets/store-soccer-ball-icon.svg",
  "sidepanel.html",
  "styles.css",
  "service-worker.js",
  "src/app.js",
  "src/audio-alerts.js",
  "src/bracket.js",
  "src/data.js",
  "src/i18n.js",
  "src/live-data.js",
  "src/match-order.js",
  "src/skins.js",
  "src/state.js",
  "src/toolbar.js"
];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const expectedPermissions = ["alarms", "notifications", "sidePanel", "storage"];

if (manifest.manifest_version !== 3) {
  throw new Error("Manifest must use version 3.");
}

if (manifest.default_locale !== "en") {
  throw new Error("Manifest must set default_locale to en so Chrome Web Store can detect localized metadata.");
}

if (
  manifest.name !== "__MSG_extensionName__"
  || manifest.description !== "__MSG_extensionDescription__"
  || manifest.action?.default_title !== "__MSG_extensionActionTitle__"
) {
  throw new Error("Manifest name, description, and toolbar title must use Chrome i18n message keys.");
}

const chromeLocaleIds = ["en", "es", "pt_BR", "ar", "fr"];
for (const localeId of chromeLocaleIds) {
  const messagesPath = path.join(root, "_locales", localeId, "messages.json");
  const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));

  for (const key of ["extensionName", "extensionDescription", "extensionActionTitle"]) {
    if (!messages[key]?.message) {
      throw new Error(`Missing Chrome i18n message ${key} for ${localeId}.`);
    }
  }
}

for (const permission of expectedPermissions) {
  if (!manifest.permissions.includes(permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

const expectedHosts = [
  "https://site.api.espn.com/*",
  "https://site.web.api.espn.com/*"
];

if (JSON.stringify(manifest.host_permissions) !== JSON.stringify(expectedHosts)) {
  throw new Error("Host permissions must be limited to the live-data provider.");
}

const dataModule = await import(path.join(root, "src/data.js"));
const i18nModule = await import(path.join(root, "src/i18n.js"));
const skinsModule = await import(path.join(root, "src/skins.js"));
const liveDataModule = await import(path.join(root, "src/live-data.js"));
const audioAlertsModule = await import(path.join(root, "src/audio-alerts.js"));
const matchOrderModule = await import(path.join(root, "src/match-order.js"));

if (dataModule.TEAMS.length !== 48) {
  throw new Error(`Expected 48 teams, found ${dataModule.TEAMS.length}.`);
}

if (skinsModule.SKINS.length !== 50) {
  throw new Error(`Expected 2 scoreboard style skins plus 48 team skins, found ${skinsModule.SKINS.length}.`);
}

const styleSkinIds = new Set(["default", "classic-scoreboard"]);
const allThemedSkins = skinsModule.SKINS.filter((skin) => !styleSkinIds.has(skin.id));
const styleSkins = skinsModule.SKINS.filter((skin) => styleSkinIds.has(skin.id));

if (styleSkins.length !== 2) {
  throw new Error("Expected Futuristic Neon and Classic Matchday Print scoreboard style skins.");
}

for (const field of ["name", "motif", "pattern"]) {
  const values = allThemedSkins.map((skin) => skin[field]);
  if (new Set(values).size !== allThemedSkins.length) {
    throw new Error(`Every themed skin must have a unique ${field}.`);
  }
}

for (const skin of styleSkins) {
  if (!skin.name || !skin.motif || !skin.pattern || skin.colors.length !== 3) {
    throw new Error(`Style skin ${skin.id} is missing theme metadata.`);
  }
}

for (const skin of allThemedSkins) {
  if (!skin.culturalNote || !skin.patternKey || skin.colors.length !== 3) {
    throw new Error(`Skin ${skin.id} is missing theme artwork metadata.`);
  }

  for (const symbolField of ["animal", "myth", "fruit"]) {
    if (!skin.symbols?.[symbolField]) {
      throw new Error(`Skin ${skin.id} is missing ${symbolField} identity metadata.`);
    }
  }

  if (!skin.description.includes(skin.team)) {
    throw new Error(`Skin ${skin.id} must identify its country inspiration.`);
  }
}

const html = fs.readFileSync(path.join(root, "sidepanel.html"), "utf8");
for (const id of ["skinList", "skinSearch", "themeStage"]) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Missing skins interface element: ${id}.`);
  }
}

for (const id of ["languageToggle", "languageMenu"]) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Missing language control element: ${id}.`);
  }
}

const targetLocaleIds = ["en", "es", "pt", "ar", "fr"];
const supportedLocaleIds = i18nModule.SUPPORTED_LOCALES.map((locale) => locale.id);
if (JSON.stringify(supportedLocaleIds) !== JSON.stringify(targetLocaleIds)) {
  throw new Error(`Supported locales must stay focused on the top-five target set: ${targetLocaleIds.join(", ")}.`);
}

const messageKeys = i18nModule.getMessageKeys();
for (const localeId of new Set(supportedLocaleIds)) {
  for (const key of messageKeys) {
    if (!i18nModule.MESSAGES[localeId]?.[key]) {
      throw new Error(`Missing i18n message ${key} for ${localeId}.`);
    }
  }
}

const teamIds = new Set(dataModule.TEAMS.map((team) => team.id));
for (const match of dataModule.MATCHES) {
  if (!teamIds.has(match.home) || !teamIds.has(match.away)) {
    throw new Error(`Match ${match.id} references an unknown team.`);
  }
}

const safeSnapshot = liveDataModule.getSafeBundledSnapshot();
if (safeSnapshot.matches.some((match) => match.status === "live")) {
  throw new Error("Offline fallback must never fabricate a live match.");
}

const previousAlertSnapshot = {
  stale: false,
  matches: [
    { id: "alert-start", status: "upcoming", homeScore: null, awayScore: null },
    { id: "alert-goal", status: "live", homeScore: 0, awayScore: 0 },
    { id: "alert-end", status: "live", homeScore: 1, awayScore: 1 },
  ],
};
const nextAlertSnapshot = {
  stale: false,
  matches: [
    { id: "alert-start", status: "live", homeScore: 0, awayScore: 0 },
    { id: "alert-goal", status: "live", homeScore: 1, awayScore: 0 },
    { id: "alert-end", status: "final", homeScore: 1, awayScore: 1 },
  ],
};
const alertTypes = audioAlertsModule.getMatchAlertEvents(previousAlertSnapshot, nextAlertSnapshot)
  .map((event) => event.type)
  .sort();

if (JSON.stringify(alertTypes) !== JSON.stringify(["end", "goal", "start"])) {
  throw new Error(`Whistle alert detection failed: ${alertTypes.join(", ")}`);
}

const liveTabNow = new Date("2026-06-30T20:00:00Z").getTime();
const liveTabFixtures = [
  { id: "live-now", status: "live", kickoff: "2026-06-28T20:00:00Z" },
  { id: "next-up", status: "upcoming", kickoff: "2026-07-01T20:00:00Z" },
  { id: "fresh-final", status: "final", kickoff: "2026-06-29T20:00:00Z", concludedAt: "2026-06-29T22:00:00Z" },
  { id: "expired-final", status: "final", kickoff: "2026-06-28T16:00:00Z", concludedAt: "2026-06-28T18:00:00Z" },
  { id: "stale-upcoming", status: "upcoming", kickoff: "2026-06-27T20:00:00Z" },
];
const liveTabIds = matchOrderModule.getCurrentLiveTabMatches(liveTabFixtures, liveTabNow)
  .map((match) => match.id);

for (const expectedId of ["live-now", "next-up", "fresh-final"]) {
  if (!liveTabIds.includes(expectedId)) {
    throw new Error(`Live tab freshness filter incorrectly removed ${expectedId}.`);
  }
}

for (const hiddenId of ["expired-final", "stale-upcoming"]) {
  if (liveTabIds.includes(hiddenId)) {
    throw new Error(`Live tab freshness filter should hide ${hiddenId}.`);
  }
}

const poisonedCachedSnapshot = liveDataModule.normalizeLiveSnapshot({
  fetchedAt: "2026-06-30T20:00:00Z",
  matches: [
    {
      id: "old-final-with-refresh-time",
      status: "final",
      kickoff: "2026-06-18T20:00:00Z",
      concludedAt: "2026-06-30T20:00:00Z",
    },
  ],
});

if (matchOrderModule.getCurrentLiveTabMatches(poisonedCachedSnapshot.matches, liveTabNow).length !== 0) {
  throw new Error("Live tab freshness filter must clean cached finals with refresh-time conclusion stamps.");
}

const bundledSchedule = JSON.parse(fs.readFileSync(
  path.join(root, "assets/data/worldcup-2026.json"),
  "utf8"
));
const normalizedSchedule = liveDataModule.parseOpenFootballMatches(bundledSchedule);
if (normalizedSchedule.length !== 104) {
  throw new Error(`Expected the complete 104-match schedule, found ${normalizedSchedule.length}.`);
}

console.log("Live Scoreboard validation passed.");
