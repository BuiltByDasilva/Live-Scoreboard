import {
  detectPreferredLocale,
  formatFreshness,
  getLocale,
  resolveLocaleId,
  SUPPORTED_LOCALES,
  t,
} from "./i18n.js";
import { buildBracket } from "./bracket.js";
import {
  getSafeBundledSnapshot,
  LIVE_CACHE_KEY,
  loadLiveSnapshot,
  refreshLiveSnapshot,
} from "./live-data.js";
import { findNextMatch, getOrderedMatches, getTeamIdsInMatchOrder } from "./match-order.js";
import { applySkin, getSkin, SKINS } from "./skins.js";
import {
  loadState,
  setActiveSkin,
  setLanguage,
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
  bracketBoard: document.querySelector("#bracketBoard"),
  skinList: document.querySelector("#skinList"),
  skinSearch: document.querySelector("#skinSearch"),
  themeStage: document.querySelector("#themeStage"),
  pinnedSpotlight: document.querySelector("#pinnedSpotlight"),
  favoritesOnly: document.querySelector("#favoritesOnly"),
  languageDock: document.querySelector("#languageDock"),
  languageCollapse: document.querySelector("#languageCollapse"),
  languageToggle: document.querySelector("#languageToggle"),
  languageMenu: document.querySelector("#languageMenu"),
  languageCurrent: document.querySelector("#languageCurrent"),
  dockSoccerBall: document.querySelector("#dockSoccerBall"),
  refreshButton: document.querySelector("#refreshButton"),
  tabs: [],
  panels: []
};

const allTabs = Array.from(document.querySelectorAll(".tabs .tab"));
const allPanels = Array.from(document.querySelectorAll(".panel"));
const allowedTabIds = new Set(["live", "watchlist", "bracket", "skins"]);
const allowedPanelIds = new Set(["live", "watchlist", "bracket", "skins"]);

allTabs.forEach((tab) => {
  if (allowedTabIds.has(tab.dataset.tab)) {
    elements.tabs.push(tab);
    return;
  }
  tab.remove();
});

allPanels.forEach((panel) => {
  if (allowedPanelIds.has(panel.dataset.panel)) {
    elements.panels.push(panel);
    return;
  }
  panel.remove();
});

let appState = await loadState();
if (!appState.languageId) {
  appState = await setLanguage(detectPreferredLocale());
}
let liveSnapshot = await loadLiveSnapshot() || getSafeBundledSnapshot();
let matches = liveSnapshot.matches;
let previewSkinId = null;
let languageId = resolveLocaleId(appState.languageId);
let isLanguageDockCollapsed = false;
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

function getPinnedMatch() {
  if (!appState.toolbarMatchId) {
    return null;
  }
  return matches.find((match) => match.id === appState.toolbarMatchId) || null;
}

function formatPinnedMeta(match, dateLabel) {
  const state = match.status === "live" ? tr("livePrefix") : match.status === "final" ? tr("finalLabel") : tr("matchesTitle");
  return `${escapeAttribute(match.stage || tr("unavailable"))} · ${escapeAttribute(state)} · ${escapeAttribute(dateLabel || "")}`;
}

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

function renderLanguageDockState() {
  const collapseLabel = tr(isLanguageDockCollapsed ? "showLanguagePanel" : "hideLanguagePanel");

  elements.languageDock?.classList.toggle("is-collapsed", isLanguageDockCollapsed);
  elements.dockSoccerBall?.classList.toggle("is-collapsed", isLanguageDockCollapsed);

  if (elements.languageCollapse) {
    elements.languageCollapse.setAttribute("aria-label", collapseLabel);
    elements.languageCollapse.setAttribute("title", collapseLabel);
    elements.languageCollapse.setAttribute("aria-pressed", String(isLanguageDockCollapsed));
  }
}

function setLanguageDockCollapsed(collapsed) {
  isLanguageDockCollapsed = collapsed;
  if (collapsed) {
    setLanguageMenuOpen(false);
  }
  renderLanguageDockState();
}

const MATCH_LOCATION_PRESETS = [
  {
    keys: ["vancouver", "toronto", "montreal", "ottawa", "bc place", "bmo field"],
    country: "Canada",
    flagUrl: getLocationFlagUrl("Canada"),
    background: "radial-gradient(circle at 18% 22%, rgba(255, 116, 127, 0.18), transparent 30%), radial-gradient(circle at 82% 76%, rgba(111, 237, 255, 0.18), transparent 36%), linear-gradient(135deg, rgba(7, 23, 39, 0.82), rgba(18, 54, 81, 0.9))",
  },
  {
    keys: ["mexico city", "monterrey", "guadalajara", "estadio", "zapopan", "guadalupe", "azteca", "bbva", "akron"],
    country: "Mexico",
    flagUrl: getLocationFlagUrl("Mexico"),
    background: "radial-gradient(circle at 12% 26%, rgba(97, 255, 154, 0.18), transparent 28%), radial-gradient(circle at 88% 18%, rgba(255, 130, 102, 0.2), transparent 30%), linear-gradient(135deg, rgba(5, 20, 34, 0.88), rgba(29, 69, 63, 0.94))",
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
    background: "radial-gradient(circle at 14% 20%, rgba(255, 90, 161, 0.18), transparent 28%), radial-gradient(circle at 82% 22%, rgba(78, 219, 255, 0.2), transparent 32%), linear-gradient(135deg, rgba(8, 19, 35, 0.9), rgba(24, 39, 78, 0.92))",
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

function renderSkinFlag(skin, className = "skin-flag", altSuffix = "flag") {
  if (!skin?.flagUrl) return "";
  const alt = skin.id === "default" ? tr("themeIconAlt") : `${skin.team} ${altSuffix}`;
  return `<img class="${className}" src="${skin.flagUrl}" alt="${escapeAttribute(alt)}" loading="lazy">`;
}

function renderLandmarkBadge(skin, className = "landmark-badge") {
  if (!skin?.landmark?.name) return "";
  return `<span class="${className}">${escapeAttribute(skin.landmark.name)}</span>`;
}

function formatKickoff(value) {
  return new Intl.DateTimeFormat(getLocale(languageId).locale, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatKickoffDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit"
  }).format(new Date(value)).toUpperCase();
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

function heroStateLabel(match) {
  if (match.status === "live") return tr("livePrefix");
  if (match.status === "final") return tr("finalLabel");
  return "Next";
}

function heroTimeLabel(match) {
  if (match.status === "live") return match.minute ? `${match.minute}'` : tr("livePrefix");
  if (match.status === "final") return tr("finalLabel");
  return formatKickoffTime(match.kickoff);
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
      <span>${formatKickoffDate(match.kickoff)}</span>
    `;
  }

  if (match.status === "final") {
    return `
      <strong>${tr("finalLabel")}</strong>
      <span>${formatKickoffDate(match.kickoff)}</span>
    `;
  }

  const kickoffLabel = formatKickoffTime(match.kickoff);
  return `
    <strong>${formatKickoffDate(match.kickoff)}</strong>
    <span>${kickoffLabel}</span>
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

  const heroSkin = getDisplayedSkin();
  const landmark = heroSkin.landmark || getSkin("default").landmark;
  const isCountrySkin = heroSkin.id !== "default" && heroSkin.id !== "classic-scoreboard";
  const patternKey = heroSkin.patternKey || "default";
  const countryScene = isCountrySkin
    ? `
      <div class="hero-country-scene pattern-${escapeAttribute(patternKey)}" aria-hidden="true">
        <span class="hero-pattern-wash"></span>
        <img class="hero-flag-ghost" src="${escapeAttribute(heroSkin.flagUrl)}" alt="" loading="lazy">
        <span class="hero-culture-mark">${escapeAttribute(heroSkin.code || "")}</span>
      </div>
    `
    : "";

  elements.heroScore.dataset.status = featured.status;
  elements.heroScore.dataset.landmark = landmark.type;
  elements.heroScore.innerHTML = `
    ${countryScene}
    <div class="hero-effects" aria-hidden="true">
      <span class="floodlight floodlight-left"></span>
      <span class="floodlight floodlight-right"></span>
      <span class="light-trail trail-one"></span>
      <span class="light-trail trail-two"></span>
      <img class="orbit-ball" src="assets/soccer-ball.svg" alt="" aria-hidden="true" loading="lazy">
    </div>
    <div class="hero-landmark landmark-${escapeAttribute(landmark.type)}" aria-hidden="true">
      <span class="landmark-sun"></span>
      <span class="landmark-figure"></span>
      <span class="landmark-name">${escapeAttribute(landmark.name)}</span>
    </div>
    <div class="hero-content">
      <div class="status-row">
        <span class="match-state ${featured.status}">${heroStateLabel(featured)}</span>
        <span class="hero-stage">${featured.stage}</span>
      </div>
      <div class="scoreline">
        <div class="team-block">
          ${renderTeamFlag(featured.homeTeam, "team-code team-flag")}
          <p class="team-name">${featured.homeTeam.name}</p>
        </div>
        <div class="score-stack">
          <div class="score">${getScore(featured)}</div>
          <span class="hero-minute">${heroTimeLabel(featured)}</span>
        </div>
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
      <div class="match-time is-${statusClass}" aria-label="${escapeAttribute(statusLabel(match))}">
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

function formatBracketKickoff(value) {
  return new Intl.DateTimeFormat(getLocale(languageId).locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getBracketStatusLabel(match) {
  if (match.status === "live") return match.statusText || tr("livePrefix");
  if (match.status === "final") return tr("finalLabel");
  return tr("upcomingLabel");
}

function renderBracketSlot(slot, match, side) {
  const isWinner = slot.team?.id && slot.team.id === match.winnerId;
  const isLoser = slot.team?.id && slot.team.id === match.loserId;
  const score = side === "home" ? match.homeScore : match.awayScore;
  const scoreLabel = match.status === "upcoming" || score == null ? "" : `<strong>${escapeAttribute(score)}</strong>`;
  const seedLabel = slot.seed && slot.seed !== slot.label ? `<small>${escapeAttribute(slot.seed)}</small>` : "";
  const teamMark = slot.team
    ? renderTeamFlag(slot.team, "bracket-team-flag team-flag")
    : `<span class="bracket-seed-icon">${escapeAttribute(slot.seed?.slice(0, 2) || "?")}</span>`;

  return `
    <div class="bracket-slot ${isWinner ? "is-winner" : ""} ${isLoser ? "is-loser" : ""} is-${escapeAttribute(slot.status)}">
      ${teamMark}
      <span class="bracket-slot-name">
        ${escapeAttribute(slot.label)}
        ${seedLabel}
      </span>
      ${scoreLabel}
    </div>
  `;
}

function renderBracketMatch(match) {
  return `
    <article class="bracket-match is-${escapeAttribute(match.status)}">
      <div class="bracket-match-top">
        <span>#${escapeAttribute(match.num)}</span>
        <span>${escapeAttribute(getBracketStatusLabel(match))}</span>
      </div>
      <div class="bracket-slots">
        ${renderBracketSlot(match.home, match, "home")}
        ${renderBracketSlot(match.away, match, "away")}
      </div>
      <div class="bracket-match-meta">
        <span>${escapeAttribute(formatBracketKickoff(match.kickoff))}</span>
        <span>${escapeAttribute(match.venue)}</span>
      </div>
    </article>
  `;
}

function renderEliminatedTeam(entry) {
  const dateLabel = entry.date ? formatBracketKickoff(entry.date) : tr("unavailable");
  const byLabel = entry.eliminatedBy || tr("unavailable");
  const scoreLabel = entry.score ? `<span>${escapeAttribute(entry.score)}</span>` : "";

  return `
    <article class="eliminated-card">
      ${renderTeamFlag(entry.team, "eliminated-flag team-flag")}
      <div>
        <h3>${escapeAttribute(entry.team.name)}</h3>
        <p>${escapeAttribute(tr("eliminatedBy", { team: byLabel }))}</p>
        <small>${escapeAttribute(entry.stage)} · ${escapeAttribute(dateLabel)}</small>
      </div>
      ${scoreLabel}
    </article>
  `;
}

function renderBracket() {
  if (!elements.bracketBoard) return;

  const bracket = buildBracket(matches);
  const nextMatch = bracket.stats.nextMatch;
  const eliminatedMarkup = bracket.eliminated.length
    ? bracket.eliminated.map(renderEliminatedTeam).join("")
    : `
      <div class="bracket-empty">
        <strong>${escapeAttribute(tr("eliminatedNoneTitle"))}</strong>
        <span>${escapeAttribute(tr("eliminatedNoneCopy"))}</span>
      </div>
    `;

  elements.bracketBoard.innerHTML = `
    <div class="bracket-summary">
      <div>
        <span>${escapeAttribute(tr("bracketRemaining"))}</span>
        <strong>${escapeAttribute(bracket.stats.remainingTeams)}</strong>
      </div>
      <div>
        <span>${escapeAttribute(tr("bracketCompleted"))}</span>
        <strong>${escapeAttribute(`${bracket.stats.completedKnockouts}/${bracket.stats.totalKnockouts}`)}</strong>
      </div>
      <div>
        <span>${escapeAttribute(tr("bracketNext"))}</span>
        <strong>${escapeAttribute(nextMatch ? `#${nextMatch.num}` : tr("finalLabel"))}</strong>
      </div>
    </div>
    <p class="bracket-feed-note">${escapeAttribute(tr("bracketFeedNote"))}</p>
    <div class="bracket-scroll-shell">
      <div class="bracket-scroll-cue" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="bracket-scroll" role="list" tabindex="0" aria-label="${escapeAttribute(tr("bracketTitle"))}">
        ${bracket.rounds.map((round) => `
          <section class="bracket-round" role="listitem">
            <h3>${escapeAttribute(round.name)}</h3>
            <div class="bracket-round-list">
              ${round.matches.map(renderBracketMatch).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </div>
    <section class="eliminated-section">
      <div class="section-heading">
        <h2>${escapeAttribute(tr("eliminatedTitle"))}</h2>
        <span class="quiet-note">${escapeAttribute(tr("eliminatedNote"))}</span>
      </div>
      <div class="eliminated-list">
        ${eliminatedMarkup}
      </div>
    </section>
  `;

  const bracketScroller = elements.bracketBoard.querySelector(".bracket-scroll");
  bracketScroller?.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    bracketScroller.scrollBy({
      left: event.deltaY,
      behavior: "smooth",
    });
  }, { passive: false });
}

function renderPinnedPanel() {
  const pinned = getPinnedMatch();
  if (!elements.pinnedSpotlight) {
    return;
  }

  if (!pinned) {
    elements.pinnedSpotlight.innerHTML = `
      <div class="pinned-empty">
        <strong>${escapeAttribute(tr("pinnedNoMatchTitle"))}</strong>
        <span>${escapeAttribute(tr("pinnedNoMatchCopy"))}</span>
      </div>
    `;
    return;
  }

  const location = getMatchLocation(pinned);
  const locationFlag = location.flagUrl
    ? renderFlagIcon(location.flagUrl, `${location.country} flag`, "pinned-location-flag", location.country)
    : "";

  const lineup = [
    renderTeamFlag(pinned.homeTeam, "team-code team-flag"),
    renderTeamFlag(pinned.awayTeam, "team-code team-flag"),
  ];

  const kickoff = formatKickoffTime(pinned.kickoff);
  const kickoffDate = formatKickoffDate(pinned.kickoff);
  const featuredSkin = getDisplayedSkin();
  const scoreA = pinned.status === "upcoming" ? "-" : `${pinned.homeScore ?? "-"}`;
  const scoreB = pinned.status === "upcoming" ? "-" : `${pinned.awayScore ?? "-"}`;
  const scoreLabel = pinned.status === "live"
    ? pinned.minute ? `${tr("livePrefix")} ${pinned.minute}'` : tr("livePrefix")
    : pinned.status === "final"
      ? tr("finalLabel")
      : tr("upcomingLabel");
  const matchLabel = `${formatKickoffDate(pinned.kickoff)} · ${scoreLabel}`;
  const kickoffMinute = formatKickoffTime(pinned.kickoff);
  const venueText = pinned.venue || tr("location");
  const stageLine = `${tr("matchStage")}: ${pinned.stage || tr("unavailable")}`;
  const kickoffUtc = `${kickoff} ${tr("utcLabel")}`;
  const teamCodes = `${pinned.homeTeam.code || tr("tbd")} · ${pinned.awayTeam.code || tr("tbd")}`;
  const culturePulse = `${featuredSkin?.culturalNote || ""} ${featuredSkin?.symbols ? `| ${tr("cultureSignal")}: ${featuredSkin.symbols.myth || ""}` : ""}`.trim();
  const teamHighlight = `${pinned.homeTeam.name} vs ${pinned.awayTeam.name}`;
  const kickoffCountdown = pinned.status === "upcoming"
    ? Math.max(0, Math.round((new Date(pinned.kickoff).getTime() - Date.now()) / 60000))
    : null;
  const kickoffHint = kickoffCountdown === null
    ? tr("upcomingLabel")
    : kickoffCountdown > 0
      ? `${kickoffCountdown}m ${tr("watch")}`
      : tr("watch");
  const stageLabel = pinned.stage || tr("unavailable");
  const cultureLabel = featuredSkin?.symbols?.myth || featuredSkin?.motif || tr("cultureSignal");
  const scoreboardMarkup = pinned.status === "upcoming"
    ? `
      <div class="pinned-scoreboard is-upcoming" aria-label="${escapeAttribute(matchLabel)}">
        <strong>${escapeAttribute(kickoffMinute)}</strong>
        <span>${escapeAttribute(kickoffDate)}</span>
      </div>
    `
    : `
      <div class="pinned-scoreboard" aria-label="${escapeAttribute(matchLabel)}">
        <span>${escapeAttribute(scoreA)}</span>
        <span class="score-sep">:</span>
        <span>${escapeAttribute(scoreB)}</span>
      </div>
    `;
  const spotlightMeta = [
    locationFlag ? `<span class="location-pill">${locationFlag} ${escapeAttribute(location.country)}</span>` : "",
    `<span>${escapeAttribute(stageLabel)}</span>`,
    kickoff ? `<span>${escapeAttribute(`${kickoff} UTC`)}</span>` : "",
    `<span>${escapeAttribute(pinned.status === "upcoming" ? kickoffHint : scoreLabel)}</span>`,
  ].filter(Boolean).join("");

  elements.pinnedSpotlight.innerHTML = `
    <article class="match-card pinned-match-card is-${escapeAttribute(pinned.status)}" style="--match-location-bg:${location.background};">
      <div class="pinned-topline">
        <span class="pinned-status-chip is-${escapeAttribute(pinned.status)}">${escapeAttribute(scoreLabel)}</span>
        <span class="pinned-stage-pill">${escapeAttribute(stageLabel)}</span>
      </div>
      <div class="pinned-headline">
        <div class="pinned-kickoff" aria-label="${escapeAttribute(formatKickoffLabelForPin(pinned))}">
          <strong>${escapeAttribute(formatKickoffDate(pinned.kickoff))}</strong>
          <span>${escapeAttribute(`${kickoffMinute} ${tr("utcLabel") || "UTC"}`)}</span>
        </div>
        <span class="pinned-skin-pill">${escapeAttribute(featuredSkin.name)}</span>
      </div>
      <div class="pinned-battle">
        <div class="pinned-team-row">
          ${lineup[0]}
          <span>${escapeAttribute(pinned.homeTeam.name)} <small class="pinned-team-code">${escapeAttribute(pinned.homeTeam.code)}</small></span>
        </div>
        ${scoreboardMarkup}
        <div class="pinned-team-row is-away">
          ${lineup[1]}
          <span>${escapeAttribute(pinned.awayTeam.name)} <small class="pinned-team-code">${escapeAttribute(pinned.awayTeam.code)}</small></span>
        </div>
      </div>
      <div class="pinned-summary">
        <p class="pinned-identity">${escapeAttribute(teamHighlight)}</p>
        <p>${escapeAttribute(teamCodes)} • ${escapeAttribute(venueText)}</p>
        <p>${escapeAttribute(culturePulse || tr("noMatchData"))}</p>
      </div>
      <div class="pinned-meta">
        ${spotlightMeta}
      </div>
      <div class="match-actions match-actions-pinned">
        <button class="match-action is-on" type="button" data-pin="${escapeAttribute(pinned.id)}" aria-pressed="true" title="${escapeAttribute(tr("pinTitle"))}">
          ${tr("unpin")}
        </button>
      </div>
      <div class="pinned-flair">
        <span>${escapeAttribute(`${tr("cultureSignal")}: ${cultureLabel}`)}</span>
        <span>${escapeAttribute(`${tr("watch")}: ${kickoffHint}`)}</span>
        <span>${escapeAttribute(stageLine)}</span>
        <span>${escapeAttribute(kickoffUtc)}</span>
      </div>
      ${renderSkinSymbols(featuredSkin, "pinned-symbols")}
    </article>
  `;
}

function formatKickoffLabelForPin(match) {
  if (match.status === "live") {
    return `${tr("livePrefix")} ${match.minute ? `${match.minute}'` : tr("upcomingLabel")}`;
  }
  if (match.status === "final") {
    return tr("finalLabel");
  }
  return formatKickoffDate(match.kickoff);
}

function renderDataStatus() {
  elements.dataStatus.textContent = liveSnapshot.stale
    ? `${tr("cachedData")} ${tr("connectedStatus")}`
    : `${tr("liveData")} ${tr("connectedStatus")}`;
  elements.dataStatus.classList.toggle("is-stale", Boolean(liveSnapshot.stale));
  elements.dataStatus.title = `${formatFreshness(languageId, liveSnapshot)} · ${liveSnapshot.error || tr("providerConnected", { provider: liveSnapshot.provider })}`;
}

function renderThemeStage() {
  if (!elements.themeStage) {
    return;
  }

  const skin = getDisplayedSkin();
  const isActive = appState.activeSkinId === skin.id && !previewSkinId;
  const previewMatch = findNextMatch(matches) || getOrderedMatches(matches)[0];

  const artwork = skin.id === "default"
    ? `<img class="theme-logo" src="assets/icon128.png" alt="${escapeAttribute(tr("themeIconAlt"))}">`
    : `
      ${renderSkinFlag(skin, "theme-flag")}
      <span class="theme-code">${skin.code}</span>
    `;

  elements.themeStage.innerHTML = `
    <div class="theme-art" style="--card-pattern:${skin.pattern}">
      ${artwork}
      ${renderLandmarkBadge(skin, "theme-landmark")}
      <span class="theme-motif">${skin.motif}</span>
      ${renderSkinSymbols(skin, "theme-symbols")}
    </div>
    <div class="theme-stage-copy">
      <div>
        <p class="theme-team">${skin.team}</p>
        <h2>${skin.name}</h2>
        <p>${skin.culturalNote}</p>
        ${renderLandmarkBadge(skin)}
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
        ${isActive ? `<span class="applied-state">${tr("applied")}</span>` : `<button type="button" data-apply-skin="${skin.id}">${tr("apply")}</button>`}
        ${previewSkinId ? `<button type="button" data-cancel-preview>${tr("backToActive")}</button>` : ""}
      </div>
    </div>
  `;
}

function getFilteredSkins() {
  if (!elements.skinSearch) {
    return SKINS;
  }

  const query = elements.skinSearch.value.trim().toLocaleLowerCase();
  const teamOrder = new Map(getTeamIdsInMatchOrder(matches).map((teamId, index) => [teamId, index]));

  return SKINS.filter((skin) => {
    const haystack = `${skin.name} ${skin.team} ${skin.motif}`.toLocaleLowerCase();
    return !query || haystack.includes(query);
  }).sort((a, b) => {
    const featuredSkinOrder = new Map([
      ["default", 0],
      ["classic-scoreboard", 1],
    ]);
    const featuredA = featuredSkinOrder.get(a.id);
    const featuredB = featuredSkinOrder.get(b.id);

    if (featuredA !== undefined || featuredB !== undefined) {
      return (featuredA ?? Number.MAX_SAFE_INTEGER) - (featuredB ?? Number.MAX_SAFE_INTEGER);
    }

    const orderA = teamOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const orderB = teamOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.team.localeCompare(b.team);
  });
}

function renderSkins() {
  if (!elements.skinList || !elements.skinSearch) {
    return;
  }

  const visibleSkins = getFilteredSkins();
  elements.skinList.innerHTML = visibleSkins.map((skin) => {
    const isSelected = previewSkinId === skin.id;
    const isPreviewing = previewSkinId === skin.id;
    const isActive = appState.activeSkinId === skin.id && !previewSkinId;
    const label = isPreviewing ? tr("previewing") : isActive ? tr("active") : tr("apply");

    const thumbnail = skin.id === "default"
      ? `<img class="skin-logo" src="assets/icon128.png" alt="">`
      : `
        ${renderSkinFlag(skin, "skin-flag")}
        <span>${skin.code}</span>
      `;

    return `
      <article class="skin-card ${isActive || isSelected ? "is-selected" : ""}">
        <button class="skin-art" type="button" data-preview-skin="${skin.id}" aria-label="${escapeAttribute(tr("previewSkinAria", { skin: skin.name }))}" style="--card-pattern:${skin.pattern}">
          ${thumbnail}
        </button>
        <div class="skin-copy">
          <p class="skin-team">${skin.team}</p>
          <h3>${skin.name}</h3>
          <p>${skin.motif}</p>
          ${renderLandmarkBadge(skin, "skin-landmark")}
          ${renderSkinSymbols(skin, "skin-symbols compact")}
        </div>
        <div class="skin-card-actions">
          <button class="skin-action ${isActive || isPreviewing ? "is-on" : ""}" type="button" data-apply-skin="${skin.id}">
            ${label}
          </button>
        </div>
      </article>
    `;
  }).join("") || `<div class="skin-empty"><strong>${tr("noThemesTitle")}</strong><span>${tr("noThemesCopy")}</span></div>`;
}

function renderAll() {
  applyLocaleDocumentState();
  renderStaticTranslations();
  renderLanguageMenu();
  renderLanguageDockState();
  renderDataStatus();
  renderHero();
  renderMatches();
  renderBracket();
  renderPinnedPanel();
  renderThemeStage();
  renderSkins();
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
  const languageCollapse = event.target.closest("#languageCollapse");
  const languageToggle = event.target.closest("#languageToggle");
  const languageOption = event.target.closest("[data-language-option]");
  const watchButton = event.target.closest("[data-watch]");
  const pinButton = event.target.closest("[data-pin]");
  const applyButton = event.target.closest("[data-apply-skin]");
  const previewButton = event.target.closest("[data-preview-skin]");
  const cancelPreviewButton = event.target.closest("[data-cancel-preview]");

  if (languageCollapse) {
    setLanguageDockCollapsed(!isLanguageDockCollapsed);
    return;
  }

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
});

elements.favoritesOnly.addEventListener("change", renderMatches);
elements.refreshButton.addEventListener("click", () => refreshLiveData({ announce: true }));
if (elements.skinSearch) {
  elements.skinSearch.addEventListener("input", renderSkins);
}

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
