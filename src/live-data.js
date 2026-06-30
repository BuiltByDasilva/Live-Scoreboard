import { TEAMS, decorateTeam, getDecoratedMatches } from "./data.js";
import { KNOCKOUT_MATCHES } from "./bracket.js";
import { createPlaceholderTeam, isPlaceholderTeamLabel } from "./flags.js";

export const LIVE_CACHE_KEY = "liveScoreSnapshot";
export const PRIMARY_PROVIDER = "ESPN public scoreboard";
export const FALLBACK_PROVIDER = "OpenFootball public-domain data";

const ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const ESPN_KNOCKOUT_URL = `${ESPN_URL}?dates=20260628-20260719&limit=200`;
const ESPN_STANDINGS_URL = "https://site.web.api.espn.com/apis/v2/sports/soccer/fifa.world/standings";
const BUNDLED_SCHEDULE_URL = new URL("../assets/data/worldcup-2026.json", import.meta.url).href;
const REQUEST_TIMEOUT_MS = 9000;
const KNOCKOUT_MATCH_WINDOW_MS = 4 * 60 * 60 * 1000;
const ESTIMATED_MATCH_DURATION_MS = 3 * 60 * 60 * 1000;
const MAX_CONCLUSION_AFTER_KICKOFF_MS = 6 * 60 * 60 * 1000;

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

const TEAM_CODE_LOOKUP = TEAMS.map((team) => team.code);

function normalizeLogoCode(logoUrl = "") {
  const normalized = String(logoUrl || "").toLowerCase();
  const match = normalized.match(/\/([a-z]{3})\.png(?:\?.*)?$/);
  return match?.[1] || null;
}

function normalizeTeamCode(value = "") {
  return String(value || "").toUpperCase().replace(/[^a-z]/gi, "");
}

function hasChromeStorage() {
  return typeof chrome !== "undefined" && chrome.storage?.local;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function buildEspnUrl(now = new Date()) {
  const start = new Date(now);
  const end = new Date(now);
  start.setUTCDate(start.getUTCDate() - 2);
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

function findTeam({ abbreviation, displayName, logo }) {
  const cleanedDisplayName = isPlaceholderTeamLabel(displayName) ? "" : displayName;

  if (!cleanedDisplayName && !abbreviation) {
    return createPlaceholderTeam();
  }

  const logoCode = normalizeLogoCode(logo);
  const code = normalizeTeamCode(abbreviation || logoCode || "");
  const hasValidCode = /^[A-Z]{3}$/.test(code);
  const byCode = TEAMS.find((team) => team.code === code);
  if (byCode) return decorateTeam(byCode);

  const byLogoCode = hasValidCode && TEAM_CODE_LOOKUP.includes(code) ? TEAMS.find((team) => team.code === code) : null;
  if (byLogoCode) return decorateTeam(byLogoCode);

  const cleaned = cleanName(displayName);
  const aliasId = NAME_ALIASES.get(cleaned);
  const byAlias = aliasId && TEAMS.find((team) => team.id === aliasId);
  const byName = TEAMS.find((team) => cleanName(team.name) === cleaned);
  if (byAlias || byName) return decorateTeam(byAlias || byName);

  if (isPlaceholderTeamLabel(displayName)) {
    return createPlaceholderTeam();
  }

  if (isPlaceholderTeamLabel(cleanedDisplayName) || !hasValidCode) {
    return createPlaceholderTeam();
  }

  return createPlaceholderTeam();
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

function toFloat(value) {
  const result = Number.parseFloat(value);
  return Number.isFinite(result) ? result : 0;
}

function toTimestamp(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

function getKickoffTimestamp(match) {
  return toTimestamp(match?.kickoff);
}

function getEstimatedConclusionTimestamp(match) {
  const kickoffTimestamp = getKickoffTimestamp(match);
  return kickoffTimestamp ? kickoffTimestamp + ESTIMATED_MATCH_DURATION_MS : null;
}

function getUsableConclusionTimestamp(match, candidates = []) {
  const kickoffTimestamp = getKickoffTimestamp(match);
  const estimatedConclusion = getEstimatedConclusionTimestamp(match);
  const latestReasonableConclusion = kickoffTimestamp
    ? kickoffTimestamp + MAX_CONCLUSION_AFTER_KICKOFF_MS
    : null;

  const candidate = candidates.find((value) => {
    const timestamp = toTimestamp(value);
    if (!timestamp) return false;
    if (!kickoffTimestamp || !latestReasonableConclusion) return true;
    return timestamp >= kickoffTimestamp && timestamp <= latestReasonableConclusion;
  });

  return toTimestamp(candidate) || estimatedConclusion || toTimestamp(candidates.find(Boolean));
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

function parseTemplateKickoff(template) {
  const [year, month, day] = template.date.split("-").map(Number);
  const timeMatch = template.time.match(/(\d{1,2}):(\d{2})\s+UTC([+-]\d+)?/i);
  const hour = Number(timeMatch?.[1] || 0);
  const minute = Number(timeMatch?.[2] || 0);
  const offset = Number(timeMatch?.[3] || 0);
  return new Date(Date.UTC(year, month - 1, day, hour - offset, minute)).toISOString();
}

function normalizeRound(value = "") {
  const normalized = String(value || "")
    .toLocaleLowerCase()
    .replaceAll("_", "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalized.includes("round-of-32")) return "Round of 32";
  if (normalized.includes("round-of-16")) return "Round of 16";
  if (normalized.includes("quarter")) return "Quarter-final";
  if (normalized.includes("semi")) return "Semi-final";
  if (normalized.includes("third")) return "Match for third place";
  if (normalized === "final" || normalized.endsWith("-final")) return "Final";
  return "";
}

const KNOCKOUT_TEMPLATES_BY_ROUND = KNOCKOUT_MATCHES.reduce((groups, template) => {
  if (!groups.has(template.round)) groups.set(template.round, []);
  groups.get(template.round).push({
    ...template,
    kickoffMs: new Date(parseTemplateKickoff(template)).getTime(),
  });
  return groups;
}, new Map());

function resolveKnockoutTemplate(event = {}) {
  const round = normalizeRound(event.season?.slug || event.season?.type?.name || event.group?.name || "");
  if (!round) return null;

  const kickoffMs = new Date(event.date || event.competitions?.[0]?.date || "").getTime();
  if (!Number.isFinite(kickoffMs)) return null;

  const candidates = KNOCKOUT_TEMPLATES_BY_ROUND.get(round) || [];
  const closest = candidates
    .map((template) => ({
      template,
      delta: Math.abs(template.kickoffMs - kickoffMs),
    }))
    .sort((a, b) => a.delta - b.delta)[0];

  return closest && closest.delta <= KNOCKOUT_MATCH_WINDOW_MS ? closest.template : null;
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
    const knockoutTemplate = resolveKnockoutTemplate(event);

    if (!competition) {
      throw new Error(`Primary feed match ${event.id || "unknown"} is incomplete.`);
    }

    const homeTeam = home?.team ? findTeam(home.team) : createPlaceholderTeam();
    const awayTeam = away?.team ? findTeam(away.team) : createPlaceholderTeam();
    const status = competition.status || event.status;
    const matchStatus = mapEspnStatus(status);
    const winnerEntry = matchStatus === "final" ? competitors.find((entry) => entry.winner) : null;
    const loserEntry = matchStatus === "final" ? competitors.find((entry) => entry.winner === false) : null;
    const winnerTeam = winnerEntry?.homeAway === "home" ? homeTeam : winnerEntry?.homeAway === "away" ? awayTeam : null;
    const loserTeam = loserEntry?.homeAway === "home" ? homeTeam : loserEntry?.homeAway === "away" ? awayTeam : null;
    const matchNumber = knockoutTemplate?.num || null;
    const kickoff = event.date || competition.date;

    return {
      id: matchNumber ? `wc26-${matchNumber}` : `espn-${event.id}`,
      providerId: String(event.id),
      num: matchNumber,
      group: knockoutTemplate ? "" : homeTeam.group || awayTeam.group || "",
      stage: knockoutTemplate?.round || getStage(homeTeam, awayTeam),
      home: homeTeam.id,
      away: awayTeam.id,
      status: matchStatus,
      minute: matchStatus === "live" ? toNumber(status.displayClock) : null,
      statusText: status?.type?.shortDetail || status?.type?.description || "Scheduled",
      homeScore: matchStatus === "upcoming" ? null : toNumber(home.score),
      awayScore: matchStatus === "upcoming" ? null : toNumber(away.score),
      winnerId: winnerTeam?.id || null,
      loserId: loserTeam?.id || null,
      kickoff,
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
      num: Number.isFinite(Number(match.num)) ? Number(match.num) : null,
      group: homeTeam.group || awayTeam.group || "",
      stage: match.group || match.round || getStage(homeTeam, awayTeam),
      home: homeTeam.id,
      away: awayTeam.id,
      status,
      minute: null,
      statusText: status === "final" ? "FT" : "Scheduled",
      homeScore: status === "final" ? toNumber(finalScore[0]) : null,
      awayScore: status === "final" ? toNumber(finalScore[1]) : null,
      winnerId: null,
      loserId: null,
      kickoff: parseOpenFootballKickoff(match.date, match.time),
      venue: match.ground || "Venue TBA",
      homeTeam,
      awayTeam,
      source: FALLBACK_PROVIDER,
    };
  }).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
}

function getStandingStat(entry, name) {
  const stat = entry?.stats?.find((item) => item.name === name);
  return stat?.value ?? stat?.displayValue ?? 0;
}

function compareStandingEntry(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

export function parseEspnStandingsEliminations(payload) {
  if (!Array.isArray(payload?.children)) return [];

  const groups = payload.children.map((child) => {
    const group = String(child.name || child.abbreviation || "").match(/Group\s+([A-L])/i)?.[1] || "";
    const entries = child.standings?.entries || [];

    return {
      group,
      entries: entries
        .map((entry) => ({
          team: findTeam(entry.team || {}),
          rank: toFloat(getStandingStat(entry, "rank")),
          points: toFloat(getStandingStat(entry, "points")),
          goalDifference: toFloat(getStandingStat(entry, "pointDifferential")),
          goalsFor: toFloat(getStandingStat(entry, "pointsFor")),
          gamesPlayed: toFloat(getStandingStat(entry, "gamesPlayed")),
        }))
        .filter((entry) => entry.team?.id && entry.team.id !== "tbd")
        .sort((a, b) => a.rank - b.rank || compareStandingEntry(a, b)),
    };
  }).filter((group) => group.group && group.entries.length >= 4 && group.entries.every((entry) => entry.gamesPlayed >= 3));

  const thirdPlace = groups
    .map((group) => ({ ...group.entries[2], group: group.group }))
    .sort((a, b) => compareStandingEntry(a, b) || a.group.localeCompare(b.group));
  const qualifiedThirdGroups = new Set(thirdPlace.slice(0, 8).map((entry) => entry.group));
  const eliminations = [];

  for (const group of groups) {
    for (const entry of group.entries) {
      const advances = entry.rank <= 2 || (entry.rank === 3 && qualifiedThirdGroups.has(group.group));
      if (advances) continue;

      eliminations.push({
        id: `standings-${group.group}-${entry.team.id}`,
        team: entry.team,
        stage: `Group ${group.group}`,
        eliminatedBy: "Group standings",
        date: null,
        score: `${entry.points} pts`,
        matchNumber: null,
      });
    }
  }

  return eliminations;
}

export async function loadLiveSnapshot() {
  if (!hasChromeStorage()) return null;
  const stored = await chrome.storage.local.get(LIVE_CACHE_KEY);
  return normalizeLiveSnapshot(stored[LIVE_CACHE_KEY] || null);
}

async function saveLiveSnapshot(snapshot) {
  const normalizedSnapshot = normalizeLiveSnapshot(snapshot);
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [LIVE_CACHE_KEY]: normalizedSnapshot });
  }
  return normalizedSnapshot;
}

function addConclusionTimestamps(matches = [], previousSnapshot = null, fetchedAt = new Date().toISOString()) {
  const previousById = new Map((previousSnapshot?.matches || []).map((match) => [match.id, match]));

  return matches.map((match) => {
    if (match.status !== "final") {
      return match;
    }

    const previous = previousById.get(match.id);
    const conclusionTimestamp = getUsableConclusionTimestamp(match, [
      match.concludedAt,
      previous?.concludedAt,
      previous?.status === "final" ? previousSnapshot?.fetchedAt : null,
      fetchedAt,
    ]);

    return {
      ...match,
      concludedAt: conclusionTimestamp ? new Date(conclusionTimestamp).toISOString() : fetchedAt,
    };
  });
}

export function normalizeLiveSnapshot(snapshot, previousSnapshot = null) {
  if (!snapshot?.matches?.length) return snapshot;
  const fetchedAt = snapshot.fetchedAt || new Date().toISOString();
  return {
    ...snapshot,
    matches: addConclusionTimestamps(snapshot.matches, previousSnapshot, fetchedAt),
  };
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
    eliminations: [],
    provider: "Bundled offline schedule",
    fetchedAt: null,
    stale: true,
    degraded: true,
  };
}

export async function refreshLiveSnapshot({ fetchImpl = fetch, now = new Date() } = {}) {
  const previous = await loadLiveSnapshot();
  const [primaryResult, bracketResult, standingsResult, scheduleResult] = await Promise.allSettled([
    fetchJson(buildEspnUrl(now), fetchImpl),
    fetchJson(ESPN_KNOCKOUT_URL, fetchImpl),
    fetchJson(ESPN_STANDINGS_URL, fetchImpl),
    fetchJson(BUNDLED_SCHEDULE_URL, fetchImpl),
  ]);

  try {
    if (primaryResult.status === "rejected") throw primaryResult.reason;
    const liveWindow = parseEspnMatches(primaryResult.value);
    const bracketWindow = bracketResult.status === "fulfilled"
      ? parseEspnMatches(bracketResult.value)
      : [];
    const eliminations = standingsResult.status === "fulfilled"
      ? parseEspnStandingsEliminations(standingsResult.value)
      : [];
    const schedule = scheduleResult.status === "fulfilled"
      ? parseOpenFootballMatches(scheduleResult.value)
      : [];
    const liveByPair = new Map([...bracketWindow, ...liveWindow].map((match) => [matchPairKey(match), match]));
    const liveByNumber = new Map([...bracketWindow, ...liveWindow]
      .filter((match) => Number.isFinite(match.num))
      .map((match) => [match.num, match]));
    const schedulePairs = new Set(schedule.map(matchPairKey));
    const scheduleNumbers = new Set(schedule.filter((match) => Number.isFinite(match.num)).map((match) => match.num));
    const matches = [
      ...schedule.map((match) => {
        const liveMatch = Number.isFinite(match.num)
          ? liveByNumber.get(match.num)
          : liveByPair.get(matchPairKey(match));
        return liveMatch ? { ...liveMatch, id: match.id } : match;
      }),
      ...[...bracketWindow, ...liveWindow].filter((match) => {
        if (Number.isFinite(match.num)) return !scheduleNumbers.has(match.num);
        return !schedulePairs.has(matchPairKey(match));
      }),
    ].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    if (!matches.length) throw new Error("Primary feed returned no matches.");

    const fetchedAt = new Date().toISOString();

    return saveLiveSnapshot({
      matches: addConclusionTimestamps(matches, previous, fetchedAt),
      eliminations,
      provider: schedule.length ? `${PRIMARY_PROVIDER} + OpenFootball schedule` : PRIMARY_PROVIDER,
      fetchedAt,
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
