import { LICENSE_STORAGE_KEY, normalizeEntitlements, PURCHASE_STATUS } from "./monetization.js";
import { SKINS } from "./skins.js";

const defaults = {
  watchedMatchIds: [],
  activeSkinId: "default",
  unlockedSkinIds: ["default"],
  toolbarMatchId: null,
  reminderMinutes: 15,
  lastNotifiedMatchIds: [],
  skinCredits: 0,
  purchaseStatus: PURCHASE_STATUS.idle,
  pendingPurchase: null,
  entitlementCache: normalizeEntitlements({ skins: ["default"] }),
  licenseId: null,
  languageId: null,
};

const memoryStore = { ...defaults };
const memorySyncStore = { [LICENSE_STORAGE_KEY]: null };

function hasChromeStorage() {
  return typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
}

function hasChromeSyncStorage() {
  return typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync;
}

function createLicenseId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replaceAll("-", "");
  }

  return `${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
}

export async function saveLicenseId(licenseId) {
  memorySyncStore[LICENSE_STORAGE_KEY] = licenseId;

  if (hasChromeStorage()) {
    try {
      await chrome.storage.local.set({ [LICENSE_STORAGE_KEY]: licenseId });
    } catch {
      // Local storage failures are uncommon but should not block onboarding.
    }
  }

  if (hasChromeSyncStorage()) {
    try {
      await chrome.storage.sync.set({ [LICENSE_STORAGE_KEY]: licenseId });
    } catch {
      // Sync can fail for permission/consent reasons in some Chrome profiles.
    }
  }

  return licenseId;
}

export async function loadState() {
  let localState = { ...memoryStore };
  let syncState = { ...memorySyncStore };

  if (hasChromeStorage()) {
    localState = await chrome.storage.local.get(defaults);
  }

  if (hasChromeSyncStorage()) {
    try {
      syncState = await chrome.storage.sync.get({ [LICENSE_STORAGE_KEY]: null });
    } catch {
      syncState = { [LICENSE_STORAGE_KEY]: null };
    }
  }

  const state = {
    ...defaults,
    ...localState,
    licenseId: syncState[LICENSE_STORAGE_KEY] || localState[LICENSE_STORAGE_KEY] || localState.licenseId || null,
  };

  if (!state.licenseId) {
    state.licenseId = createLicenseId();
    await saveLicenseId(state.licenseId);
  } else if (state.licenseId !== syncState[LICENSE_STORAGE_KEY] || state.licenseId !== localState[LICENSE_STORAGE_KEY]) {
    await saveLicenseId(state.licenseId);
  }

  return state;
}

export async function saveState(patch) {
  Object.assign(memoryStore, patch);

  if (hasChromeStorage()) {
    await chrome.storage.local.set(patch);
  }

  return loadState();
}

export async function setPurchaseStatus(purchaseStatus, pendingPurchase = null) {
  return saveState({ purchaseStatus, pendingPurchase });
}

export async function setEntitlements(entitlementPatch, purchaseStatus = PURCHASE_STATUS.paid) {
  const normalized = normalizeEntitlements(entitlementPatch);
  const entitledSkins = normalized.all2026 ? SKINS.map((skin) => skin.id) : normalized.skins;
  const unlockedSkinIds = Array.from(new Set(["default", ...entitledSkins]));
  const state = await loadState();

  return saveState({
    entitlementCache: normalized,
    unlockedSkinIds,
    skinCredits: normalized.credits,
    purchaseStatus,
    pendingPurchase: null,
    activeSkinId: unlockedSkinIds.includes(state.activeSkinId) ? state.activeSkinId : unlockedSkinIds[0],
  });
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

export async function unlockSkin(skinId) {
  const state = await loadState();
  const unlockedSkinIds = Array.from(new Set([...state.unlockedSkinIds, skinId]));
  return saveState({ unlockedSkinIds, activeSkinId: skinId });
}
