import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "manifest.json",
  "assets/data/worldcup-2026.json",
  "sidepanel.html",
  "styles.css",
  "service-worker.js",
  "supabase/functions/checkout/index.ts",
  "supabase/functions/entitlements/index.ts",
  "supabase/functions/stripe-webhook/index.ts",
  "supabase/migrations/202606220001_create_monetization.sql",
  "src/app.js",
  "src/data.js",
  "src/live-data.js",
  "src/monetization.js",
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

for (const permission of expectedPermissions) {
  if (!manifest.permissions.includes(permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

const expectedHosts = [
  "https://site.api.espn.com/*",
  "https://kmtpuvtswatkilvkffqb.supabase.co/*"
];

if (JSON.stringify(manifest.host_permissions) !== JSON.stringify(expectedHosts)) {
  throw new Error("Host permissions must remain limited to the live-data and checkout providers.");
}

const dataModule = await import(path.join(root, "src/data.js"));
const skinsModule = await import(path.join(root, "src/skins.js"));
const liveDataModule = await import(path.join(root, "src/live-data.js"));
const monetizationModule = await import(path.join(root, "src/monetization.js"));

if (dataModule.TEAMS.length !== 48) {
  throw new Error(`Expected 48 teams, found ${dataModule.TEAMS.length}.`);
}

if (skinsModule.SKINS.length !== 49) {
  throw new Error(`Expected default skin plus 48 team skins, found ${skinsModule.SKINS.length}.`);
}

const premiumSkins = skinsModule.SKINS.filter((skin) => skin.id !== "default");
for (const field of ["name", "motif", "pattern"]) {
  const values = premiumSkins.map((skin) => skin[field]);
  if (new Set(values).size !== premiumSkins.length) {
    throw new Error(`Every premium skin must have a unique ${field}.`);
  }
}

for (const skin of premiumSkins) {
  if (!skin.culturalNote || !skin.patternKey || skin.colors.length !== 3) {
    throw new Error(`Skin ${skin.id} is missing theme artwork metadata.`);
  }

  if (!skin.description.includes(skin.team)) {
    throw new Error(`Skin ${skin.id} must identify its country inspiration.`);
  }
}

const html = fs.readFileSync(path.join(root, "sidepanel.html"), "utf8");
for (const id of ["skinList", "skinSearch", "skinFilter", "themeStage"]) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Missing skins interface element: ${id}.`);
  }
}

for (const id of ["purchaseStatus", "restoreButton"]) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`Missing purchase interface element: ${id}.`);
  }
}

const expectedOffers = {
  skin_single: 99,
  skin_five: 299,
  skins_all_2026: 999,
};

for (const [sku, amountCents] of Object.entries(expectedOffers)) {
  const offer = monetizationModule.getOffer(sku);
  if (!offer || offer.amountCents !== amountCents || offer.currency !== "usd") {
    throw new Error(`Invalid purchase offer: ${sku}.`);
  }
}

const stateSource = fs.readFileSync(path.join(root, "src/state.js"), "utf8");
if (!stateSource.includes('unlockedSkinIds: ["default"]')) {
  throw new Error("Premium skins must not be pre-unlocked in the default state.");
}

const checkoutFunction = fs.readFileSync(path.join(root, "supabase/functions/checkout/index.ts"), "utf8");
const webhookFunction = fs.readFileSync(path.join(root, "supabase/functions/stripe-webhook/index.ts"), "utf8");
const monetizationMigration = fs.readFileSync(path.join(root, "supabase/migrations/202606220001_create_monetization.sql"), "utf8");

for (const source of [checkoutFunction, webhookFunction]) {
  if (!source.includes('apiVersion: "2026-02-25.clover"')) {
    throw new Error("Stripe functions must use the current pinned API version.");
  }
}

for (const requiredSql of ["purchase_entitlements", "purchase_events", "redeem_skin_credit", "apply_purchase_event"]) {
  if (!monetizationMigration.includes(requiredSql)) {
    throw new Error(`Monetization migration is missing ${requiredSql}.`);
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

const bundledSchedule = JSON.parse(fs.readFileSync(
  path.join(root, "assets/data/worldcup-2026.json"),
  "utf8"
));
const normalizedSchedule = liveDataModule.parseOpenFootballMatches(bundledSchedule);
if (normalizedSchedule.length !== 104) {
  throw new Error(`Expected the complete 104-match schedule, found ${normalizedSchedule.length}.`);
}

console.log("Live Scoreboard validation passed.");
