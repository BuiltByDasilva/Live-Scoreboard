import {
  getMatchFreshness,
  getSafeBundledSnapshot,
  LIVE_CACHE_KEY,
  loadLiveSnapshot,
  refreshLiveSnapshot,
} from "./live-data.js";
import { findNextMatch, getOrderedMatches, getTeamIdsInMatchOrder } from "./match-order.js";
import { getCheckoutCopy, getOffer, PURCHASE_STATUS } from "./monetization.js";
import { applySkin, getSkin, SKINS } from "./skins.js";
import {
  loadState,
  setActiveSkin,
  setEntitlements,
  setPurchaseStatus,
  setToolbarMatch,
  toggleWatchedMatch,
} from "./state.js";
import { getLocationFlagUrl } from "./flags.js";

const elements = {
  heroScore: document.querySelector("#heroScore"),
  dataStatus: document.querySelector("#dataStatus"),
  matchList: document.querySelector("#matchList"),
  watchlist: document.querySelector("#watchlist"),
  watchlistEmpty: document.querySelector("#watchlistEmpty"),
  skinList: document.querySelector("#skinList"),
  skinSearch: document.querySelector("#skinSearch"),
  skinFilter: document.querySelector("#skinFilter"),
  themeStage: document.querySelector("#themeStage"),
  purchaseStatus: document.querySelector("#purchaseStatus"),
  licenseSupport: document.querySelector("#licenseSupport"),
  restoreButton: document.querySelector("#restoreButton"),
  copyLicenseButton: document.querySelector("#copyLicenseButton"),
  favoritesOnly: document.querySelector("#favoritesOnly"),
  refreshButton: document.querySelector("#refreshButton"),
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel")
};

let appState = await loadState();
let liveSnapshot = await loadLiveSnapshot() || getSafeBundledSnapshot();
let matches = liveSnapshot.matches;
let previewSkinId = null;
applySkin(appState.activeSkinId);

function hasUnlockedEntitlements(entitlement = appState.entitlementCache) {
  return Boolean(
    entitlement?.all2026
    || entitlement?.credits > 0
    || (Array.isArray(entitlement?.skins) && entitlement.skins.some((skinId) => skinId !== "default"))
  );
}

const MATCH_LOCATION_PRESETS = [
  {
    keys: ["vancouver", "toronto", "montreal", "ottawa", "bc place", "bmo field"],
    country: "Canada",
    flagUrl: getLocationFlagUrl("Canada"),
    background: "linear-gradient(128deg, rgba(255, 0, 0, 0.18), rgba(0, 80, 175, 0.16) 38%, rgba(250, 250, 250, 0.05) 72%)",
  },
  {
    keys: ["mexico city", "monterrey", "guadalajara", "estadio", "zapopan", "guadalupe", "azteca", "bbva", "akron"],
    country: "Mexico",
    flagUrl: getLocationFlagUrl("Mexico"),
    background: "linear-gradient(128deg, rgba(0, 104, 71, 0.24), rgba(206, 17, 38, 0.16) 40%, rgba(0, 47, 75, 0.09) 72%)",
  },
  {
    keys: [
      "usa",
      "new york",
      "new jersey",
      "los angeles",
      "seattle",
      "dallas",
      "philadelphia",
      "houston",
      "boston",
      "atlanta",
      "miami",
      "kansas",
      "san francisco",
      "foxborough",
      "east rutherford",
      "santa clara",
      "arlington",
      "inglewood",
      "miami gardens",
      "at&t",
      "att stadium",
      "metlife",
      "lincoln financial",
      "hard rock",
      "mercedes-benz",
      "sofi",
      "lumen field",
      "levi",
      "arrowhead",
      "nrg stadium",
      "gillette",
    ],
    country: "United States",
    flagUrl: getLocationFlagUrl("United States"),
    background: "linear-gradient(128deg, rgba(60, 59, 110, 0.22), rgba(178, 34, 52, 0.1) 42%, rgba(255, 255, 255, 0.05) 72%)",
  },
];

function getMatchLocation(match = {}) {
  const venue = `${match.venue || ""} ${match.location || ""}`.toLocaleLowerCase();
  const preset = MATCH_LOCATION_PRESETS.find((entry) => entry.keys.some((key) => venue.includes(key)));

  return preset || {
    country: "Location",
    flagUrl: null,
    background: "linear-gradient(128deg, rgba(18, 31, 40, 0.22), rgba(7, 24, 39, 0.05) 42%, rgba(255, 255, 255, 0.06) 72%)",
  };
}

function bindFlagFallbacks() {
  const icons = document.querySelectorAll("img[data-flag-fallback]");
  icons.forEach((icon) => {
    if (icon.dataset.boundFallback === "1") return;

    icon.addEventListener("error", () => {
      const replacement = document.createElement("span");
      replacement.className = `${icon.className} flag-fallback-label`.trim();
      replacement.textContent = icon.dataset.fallbackLabel || "TBD";
      replacement.setAttribute("aria-label", icon.alt || "Flag unavailable");
      icon.replaceWith(replacement);
    }, { once: true });

    icon.dataset.boundFallback = "1";
  });
}

function renderFlagIcon(src, alt = "", className = "", fallbackLabel = "TBD") {
  if (!src) return "";
  return `<img class="${className}" src="${src}" alt="${alt}" data-flag-fallback="1" data-fallback-label="${fallbackLabel}" loading="lazy" />`;
}

function renderTeamFlag(team, cssClass) {
  if (team?.isPlaceholder || team?.id === "tbd") {
    return `<span class="${cssClass} is-placeholder"><span class="flag-fallback-label">TBD</span></span>`;
  }

  const src = team?.flagUrl || null;
  const alt = team?.name && team.name !== "TBD" ? `${team.name} flag` : "To be determined";
  return `<span class="${cssClass}">${renderFlagIcon(src, alt, "flag-icon", team?.code || "TBD")}</span>`;
}

function getDisplayedSkin() {
  return getSkin(previewSkinId || appState.activeSkinId);
}

function formatKickoff(value) {
  return new Intl.DateTimeFormat([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function statusLabel(match) {
  if (match.status === "live") {
    return match.minute ? `LIVE ${match.minute}'` : `LIVE ${match.statusText || ""}`.trim();
  }

  if (match.status === "final") {
    return "FT";
  }

  return formatKickoff(match.kickoff);
}

function getScore(match) {
  if (match.status === "upcoming") {
    return "-";
  }

  return `${match.homeScore}-${match.awayScore}`;
}

function getVisibleMatches() {
  const visible = elements.favoritesOnly.checked
    ? matches.filter((match) => appState.watchedMatchIds.includes(match.id))
    : matches;

  return getOrderedMatches(visible);
}

function renderHero() {
  const featured = matches.find((match) => match.id === appState.toolbarMatchId)
    || findNextMatch(matches)
    || matches[0];

  if (!featured) {
    delete elements.heroScore.dataset.status;
    elements.heroScore.innerHTML = `<div class="hero-content"><p class="quiet-note">No match data is available.</p></div>`;
    return;
  }

  elements.heroScore.dataset.status = featured.status;
  elements.heroScore.innerHTML = `
    <div class="hero-content">
      <div class="status-row">
        <span class="match-state ${featured.status}">${statusLabel(featured)}</span>
        <span>${featured.stage}</span>
      </div>
      <div class="scoreline">
        <div class="team-block">
          ${renderTeamFlag(featured.homeTeam, "team-code team-flag")}
          <p class="team-name">${featured.homeTeam.name}</p>
        </div>
        <div class="score">${getScore(featured)}</div>
        <div class="team-block">
          ${renderTeamFlag(featured.awayTeam, "team-code team-flag")}
          <p class="team-name">${featured.awayTeam.name}</p>
        </div>
      </div>
    </div>
  `;
}

function createMatchCard(match) {
  const isWatched = appState.watchedMatchIds.includes(match.id);
  const isPinned = appState.toolbarMatchId === match.id;
  const location = getMatchLocation(match);
  const statusClass = match.status;
  const locationFlagStyle = location.flagUrl ? `--match-location-flag-url:url('${location.flagUrl}');` : "";
  const locationFlagClass = location.flagUrl ? "has-location-flag" : "";
  const locationPill = location.flagUrl
    ? `<span class="pill location-pill">${renderFlagIcon(location.flagUrl, `${location.country} flag`, "inline-flag", location.country)} ${location.country}</span>`
    : "";

  return `
    <article class="match-card is-${statusClass} ${locationFlagClass}" data-match-id="${match.id}" style="${locationFlagStyle} --match-location-bg:${location.background};">
      <div>
        <div class="match-meta">
          <span class="pill ${statusClass}">${statusLabel(match)}</span>
          <span class="pill">${match.stage}</span>
          ${locationPill}
          <span class="pill">${match.venue}</span>
        </div>
        <div class="teams-row">
          <div class="team-row">
            ${renderTeamFlag(match.homeTeam, "mini-code team-flag")}
            <span>${match.homeTeam.name}</span>
            <span class="team-score">${match.homeScore ?? "-"}</span>
          </div>
          <div class="team-row">
            ${renderTeamFlag(match.awayTeam, "mini-code team-flag")}
            <span>${match.awayTeam.name}</span>
            <span class="team-score">${match.awayScore ?? "-"}</span>
          </div>
        </div>
      </div>
      <div class="match-actions">
        <button class="match-action ${isWatched ? "is-on" : ""}" type="button" data-watch="${match.id}" aria-pressed="${isWatched}">
          ${isWatched ? "Watching" : "Watch"}
        </button>
        <button class="match-action ${isPinned ? "is-on" : ""}" type="button" data-pin="${match.id}" aria-pressed="${isPinned}" title="Show this match in the Chrome toolbar">
          ${isPinned ? "In toolbar" : "Pin score"}
        </button>
      </div>
    </article>
  `;
}

function renderMatches() {
  const visibleMatches = getVisibleMatches();
  elements.matchList.innerHTML = visibleMatches.map(createMatchCard).join("");

  const watched = getOrderedMatches(matches.filter((match) => appState.watchedMatchIds.includes(match.id)));
  elements.watchlist.innerHTML = watched.map(createMatchCard).join("");
  elements.watchlistEmpty.classList.toggle("is-visible", watched.length === 0);
}

function renderDataStatus() {
  elements.dataStatus.textContent = `${liveSnapshot.stale ? "Cached data" : "Live data"} · ${getMatchFreshness(liveSnapshot)}`;
  elements.dataStatus.classList.toggle("is-stale", Boolean(liveSnapshot.stale));
  elements.dataStatus.title = liveSnapshot.error || `${liveSnapshot.provider} is connected.`;
}

function renderThemeStage() {
  const skin = getDisplayedSkin();
  const isUnlocked = appState.unlockedSkinIds.includes(skin.id);
  const isActive = appState.activeSkinId === skin.id && !previewSkinId;
  const offer = getOffer("skin_single");
  const canUseCredit = !isUnlocked && appState.entitlementCache.credits > 0;
  const previewMatch = findNextMatch(matches) || getOrderedMatches(matches)[0];

  const artwork = skin.id === "default"
    ? `<img class="theme-logo" src="assets/icon128.png" alt="Live Scoreboard 2026 icon">`
    : `<span class="theme-code">${skin.code}</span>`;

  elements.themeStage.innerHTML = `
    <div class="theme-art" style="--card-pattern:${skin.pattern}">
      ${artwork}
      <span class="theme-motif">${skin.motif}</span>
    </div>
    <div class="theme-stage-copy">
      <div>
        <p class="theme-team">${skin.team}</p>
        <h2>${skin.name}</h2>
        <p>${skin.culturalNote}</p>
      </div>
      <div class="mini-score-preview" aria-label="Sample themed score">
        ${renderTeamFlag(previewMatch?.homeTeam, "mini-code")}
        <strong>2</strong>
        <i>78'</i>
        <strong>1</strong>
        ${renderTeamFlag(previewMatch?.awayTeam, "mini-code")}
      </div>
      <div class="theme-stage-actions">
        ${isUnlocked && !isActive ? `<button type="button" data-apply-skin="${skin.id}">Apply theme</button>` : ""}
        ${canUseCredit ? `<button type="button" data-redeem-skin="${skin.id}" class="primary">Use 1 skin credit</button>` : ""}
        ${!isUnlocked && !canUseCredit ? `<button type="button" data-buy-skin="${skin.id}" class="primary">${getCheckoutCopy(offer.sku)}</button>` : ""}
        ${previewSkinId ? `<button type="button" data-cancel-preview>Back to active</button>` : ""}
        ${isActive ? `<span class="applied-state">Applied</span>` : ""}
      </div>
    </div>
  `;
}

function getFilteredSkins() {
  const query = elements.skinSearch.value.trim().toLocaleLowerCase();
  const filter = elements.skinFilter.value;
  const teamOrder = new Map(getTeamIdsInMatchOrder(matches).map((teamId, index) => [teamId, index]));

  return SKINS.filter((skin) => {
    const isUnlocked = appState.unlockedSkinIds.includes(skin.id);
    const matchesFilter = filter === "all" || (filter === "owned" ? isUnlocked : !isUnlocked);
    const haystack = `${skin.name} ${skin.team} ${skin.motif}`.toLocaleLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  }).sort((a, b) => {
    if (a.id === "default" || b.id === "default") {
      return a.id === "default" ? -1 : 1;
    }

    const orderA = teamOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const orderB = teamOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.team.localeCompare(b.team);
  });
}

function renderSkins() {
  const visibleSkins = getFilteredSkins();
  elements.skinList.innerHTML = visibleSkins.map((skin) => {
    const isUnlocked = appState.unlockedSkinIds.includes(skin.id);
    const isSelected = previewSkinId === skin.id;
    const isPreviewing = previewSkinId === skin.id && !isUnlocked;
    const isActive = appState.activeSkinId === skin.id && !previewSkinId;
    const canUseCredit = !isUnlocked && appState.entitlementCache.credits > 0;
    const label = isPreviewing ? "Previewing" : isActive ? "Active" : isUnlocked ? "Apply" : "Preview";
    const action = isUnlocked ? "apply-skin" : "preview-skin";

    const thumbnail = skin.id === "default"
      ? `<img class="skin-logo" src="assets/icon128.png" alt="">`
      : `<span>${skin.code}</span>`;

    return `
      <article class="skin-card ${isActive || isSelected ? "is-selected" : ""}">
        <button class="skin-art" type="button" data-preview-skin="${skin.id}" aria-label="Preview ${skin.name}" style="--card-pattern:${skin.pattern}">
          ${thumbnail}
        </button>
        <div class="skin-copy">
          <p class="skin-team">${skin.team}</p>
          <h3>${skin.name}</h3>
          <p>${skin.motif}</p>
        </div>
        <div class="skin-card-actions">
          <button class="skin-action ${isActive || isPreviewing ? "is-on" : ""}" type="button" data-${action}="${skin.id}">
            ${label}
          </button>
          ${canUseCredit ? `<button class="skin-price" type="button" data-redeem-skin="${skin.id}" aria-label="Use one skin credit to unlock ${skin.name}">Use credit</button>` : ""}
          ${!isUnlocked && !canUseCredit ? `<button class="skin-price" type="button" data-buy-skin="${skin.id}" aria-label="Unlock ${skin.name} for $0.99">$0.99</button>` : ""}
          ${isUnlocked ? `<span class="owned-label">Owned</span>` : ""}
        </div>
      </article>
    `;
  }).join("") || `<div class="skin-empty"><strong>No themes found.</strong><span>Try another country or collection filter.</span></div>`;
}

function renderPurchaseStatus() {
  if (!elements.purchaseStatus) return;

  const entitlement = appState.entitlementCache;
  const statusParts = [];

  if (appState.purchaseStatus === PURCHASE_STATUS.pending) {
    statusParts.push("Stripe checkout is open and waiting for payment.");
  } else if (appState.purchaseStatus === PURCHASE_STATUS.paid) {
    statusParts.push("Purchase received. Unlocks have been applied.");
  } else if (appState.purchaseStatus === PURCHASE_STATUS.restored) {
    const hasUnlock = hasUnlockedEntitlements(entitlement);
    if (hasUnlock) {
      statusParts.push("Purchases restored. Your unlocks are up to date.");
    } else {
      statusParts.push("No purchases found for this account yet.");
    }
  } else if (appState.purchaseStatus === PURCHASE_STATUS.error) {
    statusParts.push("Checkout could not start. Try again or restore purchases later.");
  } else {
    statusParts.push("Secure checkout opens in Stripe. Purchases unlock automatically after payment.");
  }

  if (entitlement.credits > 0) {
    statusParts.push(`${entitlement.credits} skin credit${entitlement.credits === 1 ? "" : "s"} remaining.`);
  }

  elements.purchaseStatus.textContent = statusParts.join(" ");

  if (elements.licenseSupport) {
    const licenseId = appState.licenseId || "";
    const shortCode = licenseId ? `${licenseId.slice(0, 8)}...${licenseId.slice(-6)}` : "Unavailable";
    elements.licenseSupport.textContent = `Support code: ${shortCode}`;
    elements.licenseSupport.title = licenseId;
  }
}

function renderAll() {
  renderDataStatus();
  renderHero();
  renderMatches();
  renderThemeStage();
  renderSkins();
  renderPurchaseStatus();
  bindFlagFallbacks();
}

function showToast(message) {
  document.querySelector(".app-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "app-toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => toast.remove(), 3200);
}

function startCheckout(itemType, itemId) {
  const offer = itemType === "bundle" && itemId === "all"
    ? getOffer("skins_all_2026")
    : itemType === "bundle" && itemId === "five"
      ? getOffer("skin_five")
      : getOffer("skin_single");

  const payload = {
    type: "START_CHECKOUT",
    sku: offer.sku,
    skinId: itemType === "skin" ? itemId : null,
  };

  setPurchaseStatus(PURCHASE_STATUS.pending, { sku: offer.sku, skinId: payload.skinId }).then((nextState) => {
    appState = nextState;
    renderPurchaseStatus();
  });

  sendRuntimeMessage(payload).then((result) => {
    if (!result?.ok) {
      setPurchaseStatus(PURCHASE_STATUS.error, { sku: offer.sku, reason: result?.error || "checkout_start_failed" }).then((nextState) => {
        appState = nextState;
        renderPurchaseStatus();
      });
      showToast("Checkout failed to open. Please retry.");
    }
  });
  showToast(`Opening ${offer.label} in Stripe checkout.`);
}

async function restorePurchases() {
  appState = await setPurchaseStatus(PURCHASE_STATUS.pending, { restore: true });
  renderPurchaseStatus();
  const result = await sendRuntimeMessage({ type: "RESTORE_PURCHASES" });
  if (!result || result.ok === false) {
    appState = await setPurchaseStatus(PURCHASE_STATUS.error, {
      restore: true,
      reason: result?.error || "restore_failed",
    });
    renderPurchaseStatus();
    showToast("Restore failed. Check your network and try again.");
    return;
  }

  if (result.entitlements) {
    appState = await setEntitlements(result.entitlements, PURCHASE_STATUS.restored);
  } else {
    appState = await loadState();
  }
  renderAll();
  if (result?.ok && hasUnlockedEntitlements(appState.entitlementCache)) {
    showToast("Purchases restored successfully.");
    return;
  }

  showToast("No active purchases found for this license.");
}

async function redeemSkinCredit(skinId) {
  appState = await setPurchaseStatus(PURCHASE_STATUS.pending, { redeemSkinId: skinId });
  renderPurchaseStatus();
  const result = await sendRuntimeMessage({ type: "REDEEM_SKIN", skinId });
  if (!result || !result.ok) {
    appState = await setPurchaseStatus(PURCHASE_STATUS.error, {
      redeemSkinId: skinId,
      reason: result?.error || "redeem_failed",
    });
    renderPurchaseStatus();
    showToast("Redeem failed. Please try again after restoring purchases.");
    return;
  }

  appState = result.entitlements
    ? await setEntitlements(result.entitlements, PURCHASE_STATUS.restored)
    : await loadState();
  renderAll();
  showToast("Skin unlocked from your credit pack.");
}

async function refreshLiveData({ announce = false } = {}) {
  elements.refreshButton.classList.add("is-loading");
  try {
    liveSnapshot = await refreshLiveSnapshot();
    matches = liveSnapshot.matches;
    renderAll();
    await sendRuntimeMessage({ type: "SCOREBOARD_REFRESHED" });
    if (announce) {
      showToast(liveSnapshot.stale ? "Live feed is unavailable. Showing the latest safe fallback." : "Scores are up to date.");
    }
  } catch (error) {
    console.error("Unable to refresh live data:", error);
    elements.dataStatus.textContent = "Live feed unavailable. Showing latest cached snapshot.";
    matches = liveSnapshot?.matches || matches;
    renderAll();
    showToast("Could not update live data right now. Showing fallback data.");
  } finally {
    elements.refreshButton.classList.remove("is-loading");
  }
}

function sendRuntimeMessage(message) {
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    return chrome.runtime.sendMessage(message)
      .then((response) => response)
      .catch(() => ({ ok: false, error: "runtime_unavailable" }));
  }
  return Promise.resolve({ ok: false, error: "runtime_unavailable" });
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    elements.tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    elements.panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === target));
  });
});

document.addEventListener("click", async (event) => {
  const watchButton = event.target.closest("[data-watch]");
  const pinButton = event.target.closest("[data-pin]");
  const applyButton = event.target.closest("[data-apply-skin]");
  const previewButton = event.target.closest("[data-preview-skin]");
  const cancelPreviewButton = event.target.closest("[data-cancel-preview]");
  const buyButton = event.target.closest("[data-buy-skin]");
  const redeemButton = event.target.closest("[data-redeem-skin]");
  const bundleButton = event.target.closest("[data-bundle]");

  if (watchButton) {
    appState = await toggleWatchedMatch(watchButton.dataset.watch);
    renderAll();
    sendRuntimeMessage({ type: "WATCHLIST_UPDATED" });
  }

  if (pinButton) {
    const matchId = pinButton.dataset.pin;
    const toolbarMatchId = appState.toolbarMatchId === matchId ? null : matchId;
    appState = await setToolbarMatch(toolbarMatchId);
    renderAll();
    await sendRuntimeMessage({ type: "PINNED_MATCH_UPDATED" });
  }

  if (applyButton) {
    previewSkinId = null;
    appState = await setActiveSkin(applyButton.dataset.applySkin);
    applySkin(appState.activeSkinId);
    renderAll();
  }

  if (previewButton) {
    const skinId = previewButton.dataset.previewSkin;
    previewSkinId = skinId;
    applySkin(skinId);
    renderHero();
    renderThemeStage();
    renderSkins();
  }

  if (cancelPreviewButton) {
    previewSkinId = null;
    applySkin(appState.activeSkinId);
    renderAll();
  }

  if (buyButton) {
    startCheckout("skin", buyButton.dataset.buySkin);
  }

  if (redeemButton) {
    await redeemSkinCredit(redeemButton.dataset.redeemSkin);
  }

  if (bundleButton) {
    startCheckout("bundle", bundleButton.dataset.bundle);
  }
});

elements.favoritesOnly.addEventListener("change", renderMatches);
elements.refreshButton.addEventListener("click", () => refreshLiveData({ announce: true }));
elements.skinSearch.addEventListener("input", renderSkins);
elements.skinFilter.addEventListener("change", renderSkins);
elements.restoreButton?.addEventListener("click", restorePurchases);
elements.copyLicenseButton?.addEventListener("click", async () => {
  const licenseId = appState.licenseId || "";
  if (!licenseId) {
    showToast("Support code is not available yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(licenseId);
    showToast("Support code copied.");
  } catch {
    showToast("Could not copy support code automatically.");
  }
});

renderAll();

refreshLiveData();
setInterval(refreshLiveData, 30000);

if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes[LIVE_CACHE_KEY]?.newValue) {
      liveSnapshot = changes[LIVE_CACHE_KEY].newValue;
      matches = liveSnapshot.matches;
      renderAll();
      return;
    }

    if (areaName === "local" || areaName === "sync") {
      loadState().then((nextState) => {
        appState = nextState;
        applySkin(appState.activeSkinId);
        renderAll();
      });
    }
  });
}
