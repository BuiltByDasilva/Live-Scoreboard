const defaults = {
  watchedMatchIds: [],
  activeSkinId: "default",
  toolbarMatchId: null,
  reminderMinutes: 15,
  lastNotifiedMatchIds: [],
  languageId: null,
};

const memoryStore = { ...defaults };

function hasChromeStorage() {
  return typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
}

export async function loadState() {
  let localState = { ...memoryStore };

  if (hasChromeStorage()) {
    localState = await chrome.storage.local.get(defaults);
  }

  return {
    ...defaults,
    ...localState,
  };
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

export async function setLanguage(languageId) {
  return saveState({ languageId });
}
