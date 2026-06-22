import { TEAMS, getDecoratedMatches } from "./data.js";

export const LIVE_CACHE_KEY = "liveScoreSnapshot";
export const PRIMARY_PROVIDER = "ESPN public scoreboard";
export const FALLBACK_PROVIDER = "OpenFootball public-domain data";

const ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const BUNDLED_SCHEDULE_URL = new URL("../assets/data/worldcup-2026.json", import.meta.url).href;
const REQUEST_TIMEOUT_MS = 9000;

const NAME_ALIASES = new Map([
  ["bosnia-herzegovina", "bih"],
  ["bosnia and herzegovina", "bih"],
  ["bosnia & herzegovina", "bih"],
  ["cape verde", "cpv"],
  ["cabo verde", "cpv"],
  ["congo dr", "cod"],
  ["dr congo", "cod"],
  ["côte d'ivoire", "civ"],
  ["cote d'ivoire", "civ"],
  ["ivory coast", "civ"],
  ["czech republic", "cze"],
  ["curacao", "cur"],
  ["curaçao", "cur"],
  ["iran", "irn"],
  ["south korea", "kor"],
  ["korea republic", "kor"],
  ["turkey", "tur"],
  ["türkiye", "tur"],
  ["united states", "usa"],
  ["united states of america", "usa"],
  ["usa", "usa"],
]);

function hasChromeStorage() {
  return typeof chrome !== "undefined" && chrome.storage?.local;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function buildEspnUrl(now = new Date()) {
  const start = new Date(now);
  const end = new Date(now);
  start.setUTCDate(start.getUTCDate() - 1);
  end.setUTCDate(end.getUTCDate() + 3);
  return `${ESPN_URL}?dates=${formatDate(start)}-${formatDate(end)}&limit=100`;
}

async function fetchJson(url, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function cleanName(value = "") {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

function findTeam({ abbreviation, displayName }) {
  const code = abbreviation?.toLocaleUpperCase();
  const byCode = TEAMS.find((team) => team.code === code);
  if (byCode) return byCode;

  const cleaned = cleanName(displayName);
  const aliasId = NAME_ALIASES.get(cleaned);
  const byAlias = aliasId && TEAMS.find((team) => team.id === aliasId);
  const byName = TEAMS.find((team) => cleanName(team.name) === cleaned);
  if (byAlias || byName) return byAlias || byName;

  return {
    id: `external-${cleaned.replace(/[^a-z0-9]+/g, "-")}`,
    group: "",
    name: displayName || code || "TBD",
    code: code || "TBD",
    colors: ["#64748b", "#f8fafc", "#334155"],
  };
}

function getStage(homeTeam, awayTeam) {
  return homeTeam.group && homeTeam.group === awayTeam.group
    ? `Group ${homeTeam.group}`
    : "Tournament match";
}

function toNumber(value) {
  const result = Number.parseInt(value, 10);
  return Number.isFinite(result) ? result : null;
}

function matchPairKey(match) {
  return [match.home, match.away].sort().join(":");
}

function mapEspnStatus(status) {
  const state = status?.type?.state;
  if (state === "in") return "live";
  if (state === "post" || status?.type?.completed) return "final";
  return "upcoming";
}

export function parseEspnMatches(payload) {
  if (!Array.isArray(payload?.events)) {
    throw new Error("Primary feed returned an invalid event list.");
  }

  return payload.events.map((event) => {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    const home = competitors.find((entry) => entry.homeAway === "home");
    const away = competitors.find((entry) => entry.homeAway === "away");

    if (!competition || !home?.team || !away?.team) {
      throw new Error(`Primary feed match ${event.id || "unknown"} is incomplete.`);
    }

    const homeTeam = findTeam(home.team);
    const awayTeam = findTeam(away.team);
    const status = competition.status || event.status;
    const matchStatus = mapEspnStatus(status);

    return {
      id: `espn-${event.id}`,
      providerId: String(event.id),
      group: homeTeam.group || awayTeam.group || "",
      stage: getStage(homeTeam, awayTeam),
      home: homeTeam.id,
      away: awayTeam.id,
      status: matchStatus,
      minute: matchStatus === "live" ? toNumber(status.displayClock) : null,
      statusText: status?.type?.shortDetail || status?.type?.description || "Scheduled",
      homeScore: matchStatus === "upcoming" ? null : toNumber(home.score),
      awayScore: matchStatus === "upcoming" ? null : toNumber(away.score),
      kickoff: event.date || competition.date,
      venue: competition.venue?.fullName || event.venue?.fullName || "Venue TBA",
      homeTeam,
      awayTeam,
      source: PRIMARY_PROVIDER,
    };
  }).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
}

function parseOpenFootballKickoff(date, time = "00:00 UTC+0") {
  const match = time.match(/(\d{1,2}):(\d{2})\s+UTC([+-]\d+)?/i);
  const [year, month, day] = date.split("-").map(Number);
  const hour = Number(match?.[1] || 0);
  const minute = Number(match?.[2] || 0);
  const offset = Number(match?.[3] || 0);
  return new Date(Date.UTC(year, month - 1, day, hour - offset, minute)).toISOString();
}

export function parseOpenFootballMatches(payload) {
  if (!Array.isArray(payload?.matches)) {
    throw new Error("Fallback feed returned an invalid match list.");
  }

  return payload.matches.map((match, index) => {
    const homeTeam = findTeam({ displayName: match.team1 });
    const awayTeam = findTeam({ displayName: match.team2 });
    const finalScore = match.score?.ft;
    const status = Array.isArray(finalScore) ? "final" : "upcoming";

    return {
      id: `wc26-${match.num || `${match.date}-${index + 1}`}`,
      providerId: `${match.date}-${index}`,
      group: homeTeam.group || awayTeam.group || "",
      stage: match.group || match.round || getStage(homeTeam, awayTeam),
      home: homeTeam.id,
      away: awayTeam.id,
      status,
      minute: null,
      statusText: status === "final" ? "FT" : "Scheduled",
      homeScore: status === "final" ? toNumber(finalScore[0]) : null,
      awayScore: status === "final" ? toNumber(finalScore[1]) : null,
      kickoff: parseOpenFootballKickoff(match.date, match.time),
      venue: match.ground || "Venue TBA",
      homeTeam,
      awayTeam,
      source: FALLBACK_PROVIDER,
    };
  }).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
}

export async function loadLiveSnapshot() {
  if (!hasChromeStorage()) return null;
  const stored = await chrome.storage.local.get(LIVE_CACHE_KEY);
  return stored[LIVE_CACHE_KEY] || null;
}

async function saveLiveSnapshot(snapshot) {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [LIVE_CACHE_KEY]: snapshot });
  }
  return snapshot;
}

export function getSafeBundledSnapshot() {
  const matches = getDecoratedMatches().map((match) => ({
    ...match,
    status: match.status === "final" ? "final" : "upcoming",
    minute: null,
    statusText: match.status === "final" ? "FT" : "Scheduled",
    homeScore: match.status === "final" ? match.homeScore : null,
    awayScore: match.status === "final" ? match.awayScore : null,
    source: "Bundled offline schedule",
  }));

  return {
    matches,
    provider: "Bundled offline schedule",
    fetchedAt: null,
    stale: true,
    degraded: true,
  };
}

export async function refreshLiveSnapshot({ fetchImpl = fetch, now = new Date() } = {}) {
  const previous = await loadLiveSnapshot();
  const [primaryResult, scheduleResult] = await Promise.allSettled([
    fetchJson(buildEspnUrl(now), fetchImpl),
    fetchJson(BUNDLED_SCHEDULE_URL, fetchImpl),
  ]);

  try {
    if (primaryResult.status === "rejected") throw primaryResult.reason;
    const liveWindow = parseEspnMatches(primaryResult.value);
    const schedule = scheduleResult.status === "fulfilled"
      ? parseOpenFootballMatches(scheduleResult.value)
      : [];
    const liveByPair = new Map(liveWindow.map((match) => [matchPairKey(match), match]));
    const schedulePairs = new Set(schedule.map(matchPairKey));
    const matches = [
      ...schedule.map((match) => {
        const liveMatch = liveByPair.get(matchPairKey(match));
        return liveMatch ? { ...liveMatch, id: match.id } : match;
      }),
      ...liveWindow.filter((match) => !schedulePairs.has(matchPairKey(match))),
    ].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    if (!matches.length) throw new Error("Primary feed returned no matches.");

    return saveLiveSnapshot({
      matches,
      provider: schedule.length ? `${PRIMARY_PROVIDER} + OpenFootball schedule` : PRIMARY_PROVIDER,
      fetchedAt: new Date().toISOString(),
      stale: false,
      degraded: false,
    });
  } catch (primaryError) {
    if (previous?.matches?.length) {
      return {
        ...previous,
        stale: true,
        degraded: true,
        error: `Live refresh failed: ${primaryError.message}`,
      };
    }

    try {
      if (scheduleResult.status === "rejected") throw scheduleResult.reason;
      const matches = parseOpenFootballMatches(scheduleResult.value);
      if (!matches.length) throw new Error("Fallback feed returned no matches.");

      return saveLiveSnapshot({
        matches,
        provider: FALLBACK_PROVIDER,
        fetchedAt: new Date().toISOString(),
        stale: true,
        degraded: true,
        error: `Primary live feed unavailable: ${primaryError.message}`,
      });
    } catch (fallbackError) {
      return {
        ...getSafeBundledSnapshot(),
        error: `All remote feeds unavailable: ${primaryError.message}; ${fallbackError.message}`,
      };
    }
  }
}

export function didScoreChange(previousSnapshot, nextSnapshot) {
  if (!previousSnapshot?.matches || !nextSnapshot?.matches) return false;

  return nextSnapshot.matches.some((match) => {
    const previous = previousSnapshot.matches.find((item) => item.id === match.id);
    if (!previous || match.status !== "live") return false;
    return match.homeScore > previous.homeScore || match.awayScore > previous.awayScore;
  });
}

export function getMatchFreshness(snapshot, now = Date.now()) {
  if (!snapshot?.fetchedAt) return "Offline schedule";
  const seconds = Math.max(0, Math.round((now - new Date(snapshot.fetchedAt).getTime()) / 1000));
  if (snapshot.stale) return `Cached ${Math.max(1, Math.round(seconds / 60))}m ago`;
  if (seconds < 60) return `Updated ${seconds}s ago`;
  return `Updated ${Math.round(seconds / 60)}m ago`;
}

export const __test = { buildEspnUrl, findTeam, parseOpenFootballKickoff };
