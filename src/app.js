import {
  getMatchFreshness,
  getSafeBundledSnapshot,
  LIVE_CACHE_KEY,
  loadLiveSnapshot,
  refreshLiveSnapshot,
} from "./live-data.js";
import { applySkin, getSkin, SKINS } from "./skins.js";
import { loadState, setActiveSkin, setToolbarMatch, toggleWatchedMatch } from "./state.js";

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

  return [...visible].sort((a, b) => {
    if (a.status === b.status) {
      return new Date(a.kickoff) - new Date(b.kickoff);
    }
    const order = { live: 0, upcoming: 1, final: 2 };
    return order[a.status] - order[b.status];
  });
}

function renderHero() {
  const featured = matches.find((match) => match.id === appState.toolbarMatchId)
    || matches.find((match) => match.status === "live")
    || matches.find((match) => match.status === "upcoming")
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
          <span class="team-code">${featured.homeTeam.code}</span>
          <p class="team-name">${featured.homeTeam.name}</p>
        </div>
        <div class="score">${getScore(featured)}</div>
        <div class="team-block">
          <span class="team-code">${featured.awayTeam.code}</span>
          <p class="team-name">${featured.awayTeam.name}</p>
        </div>
      </div>
    </div>
  `;
}

function createMatchCard(match) {
  const isWatched = appState.watchedMatchIds.includes(match.id);
  const isPinned = appState.toolbarMatchId === match.id;
  const statusClass = match.status;

  return `
    <article class="match-card is-${statusClass}" data-match-id="${match.id}">
      <div>
        <div class="match-meta">
          <span class="pill ${statusClass}">${statusLabel(match)}</span>
          <span class="pill">${match.stage}</span>
          <span class="pill">${match.venue}</span>
        </div>
        <div class="teams-row">
          <div class="team-row">
            <span class="mini-code">${match.homeTeam.code}</span>
            <span>${match.homeTeam.name}</span>
            <span class="team-score">${match.homeScore ?? "-"}</span>
          </div>
          <div class="team-row">
            <span class="mini-code">${match.awayTeam.code}</span>
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

  const watched = matches.filter((match) => appState.watchedMatchIds.includes(match.id));
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
        <span>NOR</span><strong>2</strong><i>78'</i><strong>1</strong><span>SEN</span>
      </div>
      <div class="theme-stage-actions">
        ${isUnlocked && !isActive ? `<button type="button" data-apply-skin="${skin.id}">Apply theme</button>` : ""}
        ${!isUnlocked ? `<button type="button" data-buy-skin="${skin.id}" class="primary">Unlock $0.99</button>` : ""}
        ${previewSkinId ? `<button type="button" data-cancel-preview>Back to active</button>` : ""}
        ${isActive ? `<span class="applied-state">Applied</span>` : ""}
      </div>
    </div>
  `;
}

function getFilteredSkins() {
  const query = elements.skinSearch.value.trim().toLocaleLowerCase();
  const filter = elements.skinFilter.value;

  return SKINS.filter((skin) => {
    const isUnlocked = appState.unlockedSkinIds.includes(skin.id);
    const matchesFilter = filter === "all" || (filter === "owned" ? isUnlocked : !isUnlocked);
    const haystack = `${skin.name} ${skin.team} ${skin.motif}`.toLocaleLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });
}

function renderSkins() {
  const visibleSkins = getFilteredSkins();
  elements.skinList.innerHTML = visibleSkins.map((skin) => {
    const isUnlocked = appState.unlockedSkinIds.includes(skin.id);
    const isSelected = previewSkinId === skin.id;
    const isPreviewing = previewSkinId === skin.id && !isUnlocked;
    const isActive = appState.activeSkinId === skin.id && !previewSkinId;
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
          ${!isUnlocked ? `<button class="skin-price" type="button" data-buy-skin="${skin.id}" aria-label="Unlock ${skin.name} for $0.99">$0.99</button>` : `<span class="owned-label">Owned</span>`}
        </div>
      </article>
    `;
  }).join("") || `<div class="skin-empty"><strong>No themes found.</strong><span>Try another country or collection filter.</span></div>`;
}

function renderAll() {
  renderDataStatus();
  renderHero();
  renderMatches();
  renderThemeStage();
  renderSkins();
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
  sendRuntimeMessage({ type: "START_CHECKOUT", itemType, itemId });
  showToast("Checkout is ready for Stripe connection. No purchase was charged in this MVP.");
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
  } finally {
    elements.refreshButton.classList.remove("is-loading");
  }
}

function sendRuntimeMessage(message) {
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    return chrome.runtime.sendMessage(message).catch(() => undefined);
  }
  return Promise.resolve();
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

  if (bundleButton) {
    startCheckout("bundle", bundleButton.dataset.bundle);
  }
});

elements.favoritesOnly.addEventListener("change", renderMatches);
elements.refreshButton.addEventListener("click", () => refreshLiveData({ announce: true }));
elements.skinSearch.addEventListener("input", renderSkins);
elements.skinFilter.addEventListener("change", renderSkins);

renderAll();

refreshLiveData();
setInterval(refreshLiveData, 30000);

if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[LIVE_CACHE_KEY]?.newValue) return;
    liveSnapshot = changes[LIVE_CACHE_KEY].newValue;
    matches = liveSnapshot.matches;
    renderAll();
  });
}
