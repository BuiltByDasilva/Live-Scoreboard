import {
  didScoreChange,
  getSafeBundledSnapshot,
  loadLiveSnapshot,
  refreshLiveSnapshot,
} from "./src/live-data.js";
import { loadState, saveState } from "./src/state.js";
import { getToolbarIconImageData, getToolbarPresentation } from "./src/toolbar.js";

const REFRESH_ALARM = "live-scoreboard-refresh";
const REMINDER_ALARM = "live-scoreboard-reminders";
const BADGE_RESET_ALARM = "live-scoreboard-badge-reset";
const POST_MATCH_REFRESH_PREFIX = "live-scoreboard-post-match-refresh:";
const POST_MATCH_REFRESH_MINUTES_AFTER_KICKOFF = [125, 155];

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await ensureAlarms();
  await refreshAndUpdateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureAlarms();
  await refreshAndUpdateBadge();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  let responsePromise = null;

  if (message?.type === "WATCHLIST_UPDATED") {
    checkWatchlistReminders();
  }

  if (message?.type === "SCOREBOARD_REFRESHED" || message?.type === "PINNED_MATCH_UPDATED") {
    updateBadgeFromCache();
  }

  if (!responsePromise) {
    return false;
  }

  responsePromise
    .then((response) => sendResponse(response))
    .catch((error) => sendResponse({ ok: false, error: error?.message || "message_failed" }));
  return true;
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

  if (alarm.name.startsWith(POST_MATCH_REFRESH_PREFIX)) {
    await refreshAndUpdateBadge();
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
  await schedulePostMatchRefreshes(snapshot);

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

async function schedulePostMatchRefreshes(snapshot) {
  if (!snapshot?.matches?.length) return;

  const now = Date.now();
  const scheduleHorizon = now + 4 * 24 * 60 * 60 * 1000;

  for (const match of snapshot.matches) {
    if (match.status === "final") continue;

    const kickoffTime = new Date(match.kickoff).getTime();
    if (!Number.isFinite(kickoffTime) || kickoffTime < now - 3 * 60 * 60 * 1000 || kickoffTime > scheduleHorizon) {
      continue;
    }

    for (const minutesAfterKickoff of POST_MATCH_REFRESH_MINUTES_AFTER_KICKOFF) {
      const scheduledTime = kickoffTime + minutesAfterKickoff * 60 * 1000;
      if (scheduledTime <= now) continue;

      const alarmName = `${POST_MATCH_REFRESH_PREFIX}${match.id}:${minutesAfterKickoff}`;
      const existing = await chrome.alarms.get(alarmName);
      if (!existing) {
        await chrome.alarms.create(alarmName, { when: scheduledTime });
      }
    }
  }
}

async function updateBadgeFromCache() {
  const snapshot = await loadLiveSnapshot() || getSafeBundledSnapshot();
  await updateBadge(snapshot);
}

async function updateBadge(snapshot) {
  const state = await loadState();
  const presentation = getToolbarPresentation(snapshot, state);
  const iconImageData = getToolbarIconImageData(presentation.iconMatch);
  await chrome.action.setBadgeText({ text: presentation.badgeText });
  await chrome.action.setBadgeBackgroundColor({ color: presentation.badgeColor });
  await chrome.action.setBadgeTextColor({ color: presentation.badgeColor === "#b8ff16" ? "#090b09" : "#ffffff" });
  await chrome.action.setTitle({ title: presentation.title });
  if (iconImageData) {
    await chrome.action.setIcon({ imageData: iconImageData });
  }
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

ensureAlarms();
refreshAndUpdateBadge();
