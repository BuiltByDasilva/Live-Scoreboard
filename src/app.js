import {
  detectPreferredLocale,
  formatFreshness,
  getLocale,
  resolveLocaleId,
  SUPPORTED_LOCALES,
  t,
} from "./i18n.js";
import {
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
  setLanguage,
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
  languageToggle: document.querySelector("#languageToggle"),
  languageMenu: document.querySelector("#languageMenu"),
  languageCurrent: document.querySelector("#languageCurrent"),
  refreshButton: document.querySelector("#refreshButton"),
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel")
};

let appState = await loadState();
if (!appState.languageId) {
  appState = await setLanguage(detectPreferredLocale());
}
let liveSnapshot = await loadLiveSnapshot() || getSafeBundledSnapshot();
let matches = liveSnapshot.matches;
let previewSkinId = null;
let languageId = resolveLocaleId(appState.languageId);
applySkin(appState.activeSkinId);

function tr(key, vars) {
  return t(languageId, key, vars);
}

function escapeAttribute(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const WATCH_ICON = `
  <svg class="button-symbol" aria-hidden="true" viewBox="0 0 24 24">
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>
  </svg>
`;

const PIN_ICON = `
  <svg class="button-symbol" aria-hidden="true" viewBox="0 0 24 24">
    <path d="M9 4h6l-1 7 3 3v2H7v-2l3-3-1-7Z"/>
    <path d="M12 16v5"/>
  </svg>
`;

function applyLocaleDocumentState() {
  const locale = getLocale(languageId);
  document.documentElement.lang = locale.locale;
  document.documentElement.dir = locale.dir;
}

function renderStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = tr(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", tr(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", tr(node.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", tr(node.dataset.i18nTitle));
  });
}

function setLanguageMenuOpen(isOpen) {
  if (!elements.languageToggle || !elements.languageMenu) return;
  elements.languageToggle.setAttribute("aria-expanded", String(isOpen));
  elements.languageMenu.hidden = !isOpen;
}

function renderLanguageMenu() {
  if (!elements.languageMenu) return;

  const currentLocale = getLocale(languageId);
  if (elements.languageCurrent) {
    elements.languageCurrent.textContent = currentLocale.nativeName;
  }

  elements.languageMenu.innerHTML = SUPPORTED_LOCALES.map((locale) => {
    const isActive = locale.id === languageId;
    return `
      <button class="language-option ${isActive ? "is-active" : ""}" type="button" role="option" data-language-option="${locale.id}" aria-selected="${isActive}">
        <span>${locale.nativeName}</span>
        <small>${locale.label}</small>
      </button>
    `;
  }).join("");
}

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
    background: "linear-gradient(128deg, rgba(199, 87, 55, 0.18), rgba(125, 178, 188, 0.18) 44%, rgba(255, 248, 224, 0.78) 100%)",
  },
  {
    keys: ["mexico city", "monterrey", "guadalajara", "estadio", "zapopan", "guadalupe", "azteca", "bbva", "akron"],
    country: "Mexico",
    flagUrl: getLocationFlagUrl("Mexico"),
    background: "linear-gradient(128deg, rgba(96, 142, 73, 0.22), rgba(197, 91, 53, 0.16) 42%, rgba(255, 248, 224, 0.82) 100%)",
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
    background: "linear-gradient(128deg, rgba(31, 76, 121, 0.2), rgba(184, 75, 54, 0.14) 42%, rgba(255, 248, 224, 0.8) 100%)",
  },
];

function getMatchLocation(match = {}) {
  const venue = `${match.venue || ""} ${match.location || ""}`.toLocaleLowerCase();
  const preset = MATCH_LOCATION_PRESETS.find((entry) => entry.keys.some((key) => venue.includes(key)));

  return preset || {
    country: "Location",
    flagUrl: null,
    background: "linear-gradient(128deg, rgba(124, 180, 189, 0.2), rgba(236, 190, 100, 0.14) 42%, rgba(255, 248, 224, 0.82) 100%)",
  };
}

function bindFlagFallbacks() {
  const icons = document.querySelectorAll("img[data-flag-fallback]");
  icons.forEach((icon) => {
    if (icon.dataset.boundFallback === "1") return;

    icon.addEventListener("error", () => {
      const replacement = document.createElement("span");
      replacement.className = `${icon.className} flag-fallback-label`.trim();
      replacement.textContent = icon.dataset.fallbackLabel || tr("tbd");
      replacement.setAttribute("aria-label", icon.alt || tr("flagUnavailable"));
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
    return `<span class="${cssClass} is-placeholder"><span class="flag-fallback-label">${tr("tbd")}</span></span>`;
  }

  const src = team?.flagUrl || null;
  const alt = team?.name && team.name !== "TBD" ? `${team.name} flag` : tr("tbd");
  return `<span class="${cssClass}">${renderFlagIcon(src, alt, "flag-icon", team?.code || tr("tbd"))}</span>`;
}

function getDisplayedSkin() {
  return getSkin(previewSkinId || appState.activeSkinId);
}

function renderSkinSymbols(skin, className = "skin-symbols") {
  const symbols = skin?.symbols || {};
  const entries = [
    ["Animal", symbols.animal],
    ["Myth", symbols.myth],
    ["Fruit", symbols.fruit],
  ].filter(([, value]) => value);

  if (!entries.length) return "";

  return `
    <div class="${className}">
      ${entries.map(([label, value]) => `<span><b>${label}</b>${value}</span>`).join("")}
    </div>
  `;
}

function formatKickoff(value) {
  return new Intl.DateTimeFormat(getLocale(languageId).locale, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function statusLabel(match) {
  if (match.status === "live") {
    return match.minute ? `${tr("livePrefix")} ${match.minute}'` : `${tr("livePrefix")} ${match.statusText || ""}`.trim();
  }

  if (match.status === "final") {
    return tr("finalLabel");
  }

  return formatKickoff(match.kickoff);
}

function getScore(match) {
  if (match.status === "upcoming") {
    return "VS";
  }

  return `${match.homeScore}-${match.awayScore}`;
}

function formatKickoffTime(value) {
  return new Intl.DateTimeFormat(getLocale(languageId).locale, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function renderTimeBlock(match) {
  if (match.status === "live") {
    return `
      <strong>${match.minute ? `${match.minute}'` : tr("livePrefix")}</strong>
      <span>${tr("livePrefix")}</span>
    `;
  }

  if (match.status === "final") {
    return `
      <strong>${tr("finalLabel")}</strong>
      <span>${match.stage}</span>
    `;
  }

  const [time, period = ""] = formatKickoffTime(match.kickoff).split(" ");
  return `
    <strong>${time}</strong>
    <span>${period}</span>
  `;
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
    elements.heroScore.innerHTML = `
      <div class="hero-content"><p class="quiet-note">${tr("noMatchData")}</p></div>
    `;
    return;
  }

  elements.heroScore.dataset.status = featured.status;
  elements.heroScore.innerHTML = `
    <div class="hero-effects" aria-hidden="true">
      <span class="floodlight floodlight-left"></span>
      <span class="floodlight floodlight-right"></span>
      <span class="light-trail trail-one"></span>
      <span class="light-trail trail-two"></span>
      <span class="orbit-ball"></span>
    </div>
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
      <div class="match-time" aria-label="${escapeAttribute(statusLabel(match))}">
        ${renderTimeBlock(match)}
      </div>
      <div class="match-teams">
        <div class="team-row">
          ${renderTeamFlag(match.homeTeam, "mini-code team-flag")}
          <span>${match.homeTeam.name}</span>
        </div>
        <div class="team-row">
          ${renderTeamFlag(match.awayTeam, "mini-code team-flag")}
          <span>${match.awayTeam.name}</span>
        </div>
      </div>
      <div class="match-scoreboard" aria-label="${escapeAttribute(getScore(match))}">
        <span>${match.status === "upcoming" ? "-" : (match.homeScore ?? "-")}</span>
        <span>${match.status === "upcoming" ? "-" : (match.awayScore ?? "-")}</span>
      </div>
      <div class="match-venue">
        ${locationPill || `<span class="venue-dot"></span>`}
        <strong>${match.venue}</strong>
        <span>${match.location || location.country}</span>
      </div>
      <div class="match-actions">
        <button class="match-action ${isWatched ? "is-on" : ""}" type="button" data-watch="${match.id}" aria-pressed="${isWatched}">
          ${WATCH_ICON}
          ${isWatched ? tr("watching") : tr("watch")}
        </button>
        <button class="match-action ${isPinned ? "is-on" : ""}" type="button" data-pin="${match.id}" aria-pressed="${isPinned}" title="${escapeAttribute(tr("pinTitle"))}">
          ${PIN_ICON}
          ${isPinned ? tr("inToolbar") : tr("pinScore")}
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
  elements.dataStatus.textContent = liveSnapshot.stale
    ? `${tr("cachedData")} ${tr("connectedStatus")}`
    : `${tr("liveData")} ${tr("connectedStatus")}`;
  elements.dataStatus.classList.toggle("is-stale", Boolean(liveSnapshot.stale));
  elements.dataStatus.title = `${formatFreshness(languageId, liveSnapshot)} · ${liveSnapshot.error || tr("providerConnected", { provider: liveSnapshot.provider })}`;
}

function renderThemeStage() {
  const skin = getDisplayedSkin();
  const isUnlocked = appState.unlockedSkinIds.includes(skin.id);
  const isActive = appState.activeSkinId === skin.id && !previewSkinId;
  const offer = getOffer("skin_single");
  const canUseCredit = !isUnlocked && appState.entitlementCache.credits > 0;
  const previewMatch = findNextMatch(matches) || getOrderedMatches(matches)[0];

  const artwork = skin.id === "default"
    ? `<img class="theme-logo" src="assets/icon128.png" alt="${escapeAttribute(tr("themeIconAlt"))}">`
    : `<span class="theme-code">${skin.code}</span>`;

  elements.themeStage.innerHTML = `
    <div class="theme-art" style="--card-pattern:${skin.pattern}">
      ${artwork}
      <span class="theme-motif">${skin.motif}</span>
      ${renderSkinSymbols(skin, "theme-symbols")}
    </div>
    <div class="theme-stage-copy">
      <div>
        <p class="theme-team">${skin.team}</p>
        <h2>${skin.name}</h2>
        <p>${skin.culturalNote}</p>
        ${renderSkinSymbols(skin)}
      </div>
      <div class="mini-score-preview" aria-label="${escapeAttribute(tr("sampleScoreAria"))}">
        ${renderTeamFlag(previewMatch?.homeTeam, "mini-code")}
        <strong>2</strong>
        <i>78'</i>
        <strong>1</strong>
        ${renderTeamFlag(previewMatch?.awayTeam, "mini-code")}
      </div>
      <div class="theme-stage-actions">
        ${isUnlocked && !isActive ? `<button type="button" data-apply-skin="${skin.id}">${tr("applyTheme")}</button>` : ""}
        ${canUseCredit ? `<button type="button" data-redeem-skin="${skin.id}" class="primary">${tr("useOneSkinCredit")}</button>` : ""}
        ${!isUnlocked && !canUseCredit ? `<button type="button" data-buy-skin="${skin.id}" class="primary">${getCheckoutCopy(offer.sku)}</button>` : ""}
        ${previewSkinId ? `<button type="button" data-cancel-preview>${tr("backToActive")}</button>` : ""}
        ${isActive ? `<span class="applied-state">${tr("applied")}</span>` : ""}
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
    const label = isPreviewing ? tr("previewing") : isActive ? tr("active") : isUnlocked ? tr("apply") : tr("preview");
    const action = isUnlocked ? "apply-skin" : "preview-skin";

    const thumbnail = skin.id === "default"
      ? `<img class="skin-logo" src="assets/icon128.png" alt="">`
      : `<span>${skin.code}</span>`;

    return `
      <article class="skin-card ${isActive || isSelected ? "is-selected" : ""}">
        <button class="skin-art" type="button" data-preview-skin="${skin.id}" aria-label="${escapeAttribute(tr("previewSkinAria", { skin: skin.name }))}" style="--card-pattern:${skin.pattern}">
          ${thumbnail}
        </button>
        <div class="skin-copy">
          <p class="skin-team">${skin.team}</p>
          <h3>${skin.name}</h3>
          <p>${skin.motif}</p>
          ${renderSkinSymbols(skin, "skin-symbols compact")}
        </div>
        <div class="skin-card-actions">
          <button class="skin-action ${isActive || isPreviewing ? "is-on" : ""}" type="button" data-${action}="${skin.id}">
            ${label}
          </button>
          ${canUseCredit ? `<button class="skin-price" type="button" data-redeem-skin="${skin.id}" aria-label="${escapeAttribute(tr("useCreditAria", { skin: skin.name }))}">${tr("useCredit")}</button>` : ""}
          ${!isUnlocked && !canUseCredit ? `<button class="skin-price" type="button" data-buy-skin="${skin.id}" aria-label="${escapeAttribute(tr("unlockSkinAria", { skin: skin.name }))}">$0.99</button>` : ""}
          ${isUnlocked ? `<span class="owned-label">${tr("owned")}</span>` : ""}
        </div>
      </article>
    `;
  }).join("") || `<div class="skin-empty"><strong>${tr("noThemesTitle")}</strong><span>${tr("noThemesCopy")}</span></div>`;
}

function renderPurchaseStatus() {
  if (!elements.purchaseStatus) return;

  const entitlement = appState.entitlementCache;
  const statusParts = [];

  if (appState.purchaseStatus === PURCHASE_STATUS.pending) {
    statusParts.push(tr("checkoutPending"));
  } else if (appState.purchaseStatus === PURCHASE_STATUS.paid) {
    statusParts.push(tr("purchaseReceived"));
  } else if (appState.purchaseStatus === PURCHASE_STATUS.restored) {
    const hasUnlock = hasUnlockedEntitlements(entitlement);
    if (hasUnlock) {
      statusParts.push(tr("purchasesRestored"));
    } else {
      statusParts.push(tr("noPurchasesFound"));
    }
  } else if (appState.purchaseStatus === PURCHASE_STATUS.error) {
    statusParts.push(tr("checkoutCouldNotStart"));
  } else {
    statusParts.push(tr("purchaseDefault"));
  }

  if (entitlement.credits > 0) {
    statusParts.push(entitlement.credits === 1
      ? tr("creditRemainingOne")
      : tr("creditRemainingMany", { count: entitlement.credits }));
  }

  elements.purchaseStatus.textContent = statusParts.join(" ");

  if (elements.licenseSupport) {
    const licenseId = appState.licenseId || "";
    const shortCode = licenseId ? `${licenseId.slice(0, 8)}...${licenseId.slice(-6)}` : tr("unavailable");
    elements.licenseSupport.textContent = tr("supportCode", { code: shortCode });
    elements.licenseSupport.title = licenseId;
  }
}

function renderAll() {
  applyLocaleDocumentState();
  renderStaticTranslations();
  renderLanguageMenu();
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
      showToast(tr("checkoutFailedToast"));
    }
  });
  showToast(tr("openingCheckoutToast", { offer: offer.label }));
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
    showToast(tr("restoreFailedToast"));
    return;
  }

  if (result.entitlements) {
    appState = await setEntitlements(result.entitlements, PURCHASE_STATUS.restored);
  } else {
    appState = await loadState();
  }
  renderAll();
  if (result?.ok && hasUnlockedEntitlements(appState.entitlementCache)) {
    showToast(tr("restoredToast"));
    return;
  }

  showToast(tr("noActivePurchasesToast"));
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
    showToast(tr("redeemFailedToast"));
    return;
  }

  appState = result.entitlements
    ? await setEntitlements(result.entitlements, PURCHASE_STATUS.restored)
    : await loadState();
  renderAll();
  showToast(tr("skinUnlockedToast"));
}

async function refreshLiveData({ announce = false } = {}) {
  elements.refreshButton.classList.add("is-loading");
  try {
    liveSnapshot = await refreshLiveSnapshot();
    matches = liveSnapshot.matches;
    renderAll();
    await sendRuntimeMessage({ type: "SCOREBOARD_REFRESHED" });
    if (announce) {
      showToast(liveSnapshot.stale ? tr("liveUnavailableToast") : tr("scoresUpToDateToast"));
    }
  } catch (error) {
    console.error("Unable to refresh live data:", error);
    elements.dataStatus.textContent = tr("liveUnavailableToast");
    matches = liveSnapshot?.matches || matches;
    renderAll();
    showToast(tr("updateFailedToast"));
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
  const languageToggle = event.target.closest("#languageToggle");
  const languageOption = event.target.closest("[data-language-option]");
  const watchButton = event.target.closest("[data-watch]");
  const pinButton = event.target.closest("[data-pin]");
  const applyButton = event.target.closest("[data-apply-skin]");
  const previewButton = event.target.closest("[data-preview-skin]");
  const cancelPreviewButton = event.target.closest("[data-cancel-preview]");
  const buyButton = event.target.closest("[data-buy-skin]");
  const redeemButton = event.target.closest("[data-redeem-skin]");
  const bundleButton = event.target.closest("[data-bundle]");

  if (languageToggle) {
    setLanguageMenuOpen(elements.languageMenu?.hidden ?? true);
    return;
  }

  if (languageOption) {
    appState = await setLanguage(languageOption.dataset.languageOption);
    languageId = resolveLocaleId(appState.languageId);
    setLanguageMenuOpen(false);
    renderAll();
    return;
  }

  if (!event.target.closest(".language-dock")) {
    setLanguageMenuOpen(false);
  }

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
    showToast(tr("supportCodeUnavailableToast"));
    return;
  }

  try {
    await navigator.clipboard.writeText(licenseId);
    showToast(tr("supportCodeCopiedToast"));
  } catch {
    showToast(tr("copySupportFailedToast"));
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setLanguageMenuOpen(false);
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
        languageId = resolveLocaleId(appState.languageId);
        applySkin(appState.activeSkinId);
        renderAll();
      });
    }
  });
}
