const defaults = {
  watchedMatchIds: [],
  activeSkinId: "default",
  unlockedSkinIds: ["default", "usa", "mex", "can"],
  toolbarMatchId: null,
  reminderMinutes: 15,
  lastNotifiedMatchIds: []
};

const memoryStore = { ...defaults };

function hasChromeStorage() {
  return typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
}

export async function loadState() {
  if (!hasChromeStorage()) {
    return { ...memoryStore };
  }

  const stored = await chrome.storage.local.get(defaults);
  return { ...defaults, ...stored };
}

export async function saveState(patch) {
  Object.assign(memoryStore, patch);

  if (hasChromeStorage()) {
    await chrome.storage.local.set(patch);
  }

  return loadState();
}

export async function toggleWatchedMatch(matchId) {
  const state = await loadState();
  const exists = state.watchedMatchIds.includes(matchId);
  const watchedMatchIds = exists
    ? state.watchedMatchIds.filter((id) => id !== matchId)
    : [...state.watchedMatchIds, matchId];

  return saveState({ watchedMatchIds });
}

export async function setActiveSkin(activeSkinId) {
  return saveState({ activeSkinId });
}

export async function setToolbarMatch(toolbarMatchId) {
  return saveState({ toolbarMatchId });
}

export async function unlockSkin(skinId) {
  const state = await loadState();
  const unlockedSkinIds = Array.from(new Set([...state.unlockedSkinIds, skinId]));
  return saveState({ unlockedSkinIds, activeSkinId: skinId });
}
