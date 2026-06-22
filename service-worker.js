import {
  didScoreChange,
  getSafeBundledSnapshot,
  loadLiveSnapshot,
  refreshLiveSnapshot,
} from "./src/live-data.js";
import { MONETIZATION_API_BASE, PURCHASE_OFFERS, PURCHASE_STATUS } from "./src/monetization.js";
import { loadState, saveState, saveLicenseId, setEntitlements, setPurchaseStatus } from "./src/state.js";
import { getToolbarPresentation } from "./src/toolbar.js";

const REFRESH_ALARM = "live-scoreboard-refresh";
const REMINDER_ALARM = "live-scoreboard-reminders";
const BADGE_RESET_ALARM = "live-scoreboard-badge-reset";

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await ensureAlarms();
  await refreshAndUpdateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureAlarms();
  await refreshAndUpdateBadge();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "WATCHLIST_UPDATED") {
    checkWatchlistReminders();
  }

  if (message?.type === "SCOREBOARD_REFRESHED" || message?.type === "PINNED_MATCH_UPDATED") {
    updateBadgeFromCache();
  }

  if (message?.type === "START_CHECKOUT") {
    void startCheckout(message);
  }

  if (message?.type === "RESTORE_PURCHASES") {
    void restorePurchases();
  }

  if (message?.type === "REDEEM_SKIN") {
    void redeemSkin(message.skinId);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === REFRESH_ALARM) {
    await refreshAndUpdateBadge();
  }

  if (alarm.name === REMINDER_ALARM) {
    await checkWatchlistReminders();
  }

  if (alarm.name === BADGE_RESET_ALARM) {
    await updateBadgeFromCache();
  }
});

async function ensureAlarms() {
  const refresh = await chrome.alarms.get(REFRESH_ALARM);
  const reminders = await chrome.alarms.get(REMINDER_ALARM);

  if (!refresh) {
    await chrome.alarms.create(REFRESH_ALARM, {
      periodInMinutes: 0.5,
    });
  }

  if (!reminders) {
    await chrome.alarms.create(REMINDER_ALARM, {
      periodInMinutes: 1,
    });
  }
}

async function refreshAndUpdateBadge() {
  const previous = await loadLiveSnapshot();
  const snapshot = await refreshLiveSnapshot();

  if (didScoreChange(previous, snapshot)) {
    await chrome.action.setBadgeText({ text: "GOAL" });
    await chrome.action.setBadgeBackgroundColor({ color: "#b8ff16" });
    await chrome.action.setBadgeTextColor({ color: "#090b09" });
    await chrome.action.setTitle({ title: "GOAL! Open Live Scoreboard for the updated score." });
    await chrome.alarms.create(BADGE_RESET_ALARM, { delayInMinutes: 0.5 });
    return;
  }

  await updateBadge(snapshot);
}

async function updateBadgeFromCache() {
  const snapshot = await loadLiveSnapshot() || getSafeBundledSnapshot();
  await updateBadge(snapshot);
}

async function updateBadge(snapshot) {
  const state = await loadState();
  const presentation = getToolbarPresentation(snapshot, state);
  await chrome.action.setBadgeText({ text: presentation.badgeText });
  await chrome.action.setBadgeBackgroundColor({ color: presentation.badgeColor });
  await chrome.action.setBadgeTextColor({ color: presentation.badgeColor === "#b8ff16" ? "#090b09" : "#ffffff" });
  await chrome.action.setTitle({ title: presentation.title });
}

async function checkWatchlistReminders() {
  const state = await loadState();
  const snapshot = await loadLiveSnapshot() || getSafeBundledSnapshot();
  const now = Date.now();
  const nextNotifiedIds = new Set(state.lastNotifiedMatchIds);

  for (const match of snapshot.matches) {
    if (!state.watchedMatchIds.includes(match.id) || match.status !== "upcoming") {
      continue;
    }

    const kickoffTime = new Date(match.kickoff).getTime();
    const minutesAway = Math.round((kickoffTime - now) / 60000);
    const shouldNotify = minutesAway <= state.reminderMinutes && minutesAway >= 0;

    if (shouldNotify && !nextNotifiedIds.has(match.id)) {
      await chrome.notifications.create(`kickoff-${match.id}`, {
        type: "basic",
        iconUrl: "assets/icon128.png",
        title: "Game starting soon",
        message: `${match.homeTeam.name} vs ${match.awayTeam.name} kicks off in about ${minutesAway} minutes.`,
      });
      nextNotifiedIds.add(match.id);
    }
  }

  await saveState({ lastNotifiedMatchIds: Array.from(nextNotifiedIds) });
}

async function ensureLicenseId() {
  const state = await loadState();
  if (state.licenseId) {
    return state.licenseId;
  }

  const licenseId = crypto.randomUUID().replaceAll("-", "");
  await saveLicenseId(licenseId);
  return licenseId;
}

async function startCheckout(message) {
  const payload = {
    licenseId: await ensureLicenseId(),
    sku: message.sku,
    skinId: message.skinId || null,
  };

  if (!Object.hasOwn(PURCHASE_OFFERS, payload.sku)) {
    await setPurchaseStatus(PURCHASE_STATUS.error, payload);
    return;
  }

  await setPurchaseStatus(PURCHASE_STATUS.pending, payload);
  try {
    const response = await fetch(`${MONETIZATION_API_BASE}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Checkout failed with ${response.status}.`);
    const data = await response.json();
    const checkoutUrl = new URL(data.checkoutUrl);
    if (checkoutUrl.protocol !== "https:") throw new Error("Checkout URL must use HTTPS.");
    await chrome.tabs.create({ url: checkoutUrl.href });
  } catch {
    await setPurchaseStatus(PURCHASE_STATUS.error, payload);
  }
}

async function restorePurchases() {
  const licenseId = await ensureLicenseId();
  try {
    const response = await fetch(`${MONETIZATION_API_BASE}/entitlements/${licenseId}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Restore failed with ${response.status}.`);
    await setEntitlements(await response.json(), PURCHASE_STATUS.restored);
  } catch {
    await setPurchaseStatus(PURCHASE_STATUS.error, { restore: true });
  }
}

async function redeemSkin(skinId) {
  const payload = { licenseId: await ensureLicenseId(), skinId };
  try {
    const response = await fetch(`${MONETIZATION_API_BASE}/entitlements/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Redemption failed with ${response.status}.`);
    await setEntitlements(await response.json(), PURCHASE_STATUS.restored);
  } catch {
    await setPurchaseStatus(PURCHASE_STATUS.error, { redeemSkinId: skinId });
  }
}

ensureAlarms();
refreshAndUpdateBadge();
