const CURRENT_MATCH_GRACE_MS = 3 * 60 * 60 * 1000;

function getKickoffTime(match) {
  const timestamp = new Date(match?.kickoff || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

function getTeamId(team, fallbackId) {
  const id = team?.id || fallbackId || "";
  return id && id !== "tbd" ? id : null;
}

function getMatchBucket(match, now = Date.now()) {
  if (match?.status === "live") return 0;

  if (match?.status === "upcoming") {
    return getKickoffTime(match) + CURRENT_MATCH_GRACE_MS >= now ? 1 : 2;
  }

  if (match?.status === "final") return 3;
  return 4;
}

export function compareMatchesByNextUp(a, b, now = Date.now()) {
  const bucketA = getMatchBucket(a, now);
  const bucketB = getMatchBucket(b, now);
  if (bucketA !== bucketB) return bucketA - bucketB;

  const timeA = getKickoffTime(a);
  const timeB = getKickoffTime(b);
  if (bucketA === 2 || bucketA === 3) return timeB - timeA;
  return timeA - timeB;
}

export function getOrderedMatches(matches = [], now = Date.now()) {
  return [...matches].sort((a, b) => compareMatchesByNextUp(a, b, now));
}

export function findNextMatch(matches = [], now = Date.now()) {
  const ordered = getOrderedMatches(matches, now);
  return ordered.find((match) => getMatchBucket(match, now) < 2)
    || ordered.find((match) => match.status === "upcoming")
    || ordered[0]
    || null;
}

export function getTeamIdsInMatchOrder(matches = [], now = Date.now()) {
  const teamIds = [];
  const seen = new Set();

  for (const match of getOrderedMatches(matches, now)) {
    for (const teamId of [
      getTeamId(match.homeTeam, match.home),
      getTeamId(match.awayTeam, match.away),
    ]) {
      if (!teamId || seen.has(teamId)) continue;
      seen.add(teamId);
      teamIds.push(teamId);
    }
  }

  return teamIds;
}
