export const KNOCKOUT_MATCHES = [
  { round: "Round of 32", num: 73, date: "2026-06-28", time: "12:00 UTC-7", team1: "2A", team2: "2B", ground: "Los Angeles (Inglewood)" },
  { round: "Round of 32", num: 74, date: "2026-06-29", time: "16:30 UTC-4", team1: "1E", team2: "3A/B/C/D/F", ground: "Boston (Foxborough)" },
  { round: "Round of 32", num: 75, date: "2026-06-29", time: "19:00 UTC-6", team1: "1F", team2: "2C", ground: "Monterrey (Guadalupe)" },
  { round: "Round of 32", num: 76, date: "2026-06-29", time: "12:00 UTC-5", team1: "1C", team2: "2F", ground: "Houston" },
  { round: "Round of 32", num: 77, date: "2026-06-30", time: "17:00 UTC-4", team1: "1I", team2: "3C/D/F/G/H", ground: "New York/New Jersey (East Rutherford)" },
  { round: "Round of 32", num: 78, date: "2026-06-30", time: "12:00 UTC-5", team1: "2E", team2: "2I", ground: "Dallas (Arlington)" },
  { round: "Round of 32", num: 79, date: "2026-06-30", time: "19:00 UTC-6", team1: "1A", team2: "3C/E/F/H/I", ground: "Mexico City" },
  { round: "Round of 32", num: 80, date: "2026-07-01", time: "12:00 UTC-4", team1: "1L", team2: "3E/H/I/J/K", ground: "Atlanta" },
  { round: "Round of 32", num: 81, date: "2026-07-01", time: "17:00 UTC-7", team1: "1D", team2: "3B/E/F/I/J", ground: "San Francisco Bay Area (Santa Clara)" },
  { round: "Round of 32", num: 82, date: "2026-07-01", time: "13:00 UTC-7", team1: "1G", team2: "3A/E/H/I/J", ground: "Seattle" },
  { round: "Round of 32", num: 83, date: "2026-07-02", time: "19:00 UTC-4", team1: "2K", team2: "2L", ground: "Toronto" },
  { round: "Round of 32", num: 84, date: "2026-07-02", time: "12:00 UTC-7", team1: "1H", team2: "2J", ground: "Los Angeles (Inglewood)" },
  { round: "Round of 32", num: 85, date: "2026-07-02", time: "20:00 UTC-7", team1: "1B", team2: "3E/F/G/I/J", ground: "Vancouver" },
  { round: "Round of 32", num: 86, date: "2026-07-03", time: "18:00 UTC-4", team1: "1J", team2: "2H", ground: "Miami (Miami Gardens)" },
  { round: "Round of 32", num: 87, date: "2026-07-03", time: "20:30 UTC-5", team1: "1K", team2: "3D/E/I/J/L", ground: "Kansas City" },
  { round: "Round of 32", num: 88, date: "2026-07-03", time: "13:00 UTC-5", team1: "2D", team2: "2G", ground: "Dallas (Arlington)" },
  { round: "Round of 16", num: 89, date: "2026-07-04", time: "17:00 UTC-4", team1: "W74", team2: "W77", ground: "Philadelphia" },
  { round: "Round of 16", num: 90, date: "2026-07-04", time: "12:00 UTC-5", team1: "W73", team2: "W75", ground: "Houston" },
  { round: "Round of 16", num: 91, date: "2026-07-05", time: "16:00 UTC-4", team1: "W76", team2: "W78", ground: "New York/New Jersey (East Rutherford)" },
  { round: "Round of 16", num: 92, date: "2026-07-05", time: "18:00 UTC-6", team1: "W79", team2: "W80", ground: "Mexico City" },
  { round: "Round of 16", num: 93, date: "2026-07-06", time: "14:00 UTC-5", team1: "W83", team2: "W84", ground: "Dallas (Arlington)" },
  { round: "Round of 16", num: 94, date: "2026-07-06", time: "17:00 UTC-7", team1: "W81", team2: "W82", ground: "Seattle" },
  { round: "Round of 16", num: 95, date: "2026-07-07", time: "12:00 UTC-4", team1: "W86", team2: "W88", ground: "Atlanta" },
  { round: "Round of 16", num: 96, date: "2026-07-07", time: "13:00 UTC-7", team1: "W85", team2: "W87", ground: "Vancouver" },
  { round: "Quarter-final", num: 97, date: "2026-07-09", time: "16:00 UTC-4", team1: "W89", team2: "W90", ground: "Boston (Foxborough)" },
  { round: "Quarter-final", num: 98, date: "2026-07-10", time: "12:00 UTC-7", team1: "W93", team2: "W94", ground: "Los Angeles (Inglewood)" },
  { round: "Quarter-final", num: 99, date: "2026-07-11", time: "17:00 UTC-4", team1: "W91", team2: "W92", ground: "Miami (Miami Gardens)" },
  { round: "Quarter-final", num: 100, date: "2026-07-11", time: "20:00 UTC-5", team1: "W95", team2: "W96", ground: "Kansas City" },
  { round: "Semi-final", num: 101, date: "2026-07-14", time: "14:00 UTC-5", team1: "W97", team2: "W98", ground: "Dallas (Arlington)" },
  { round: "Semi-final", num: 102, date: "2026-07-15", time: "15:00 UTC-4", team1: "W99", team2: "W100", ground: "Atlanta" },
  { round: "Match for third place", num: 103, date: "2026-07-18", time: "17:00 UTC-4", team1: "L101", team2: "L102", ground: "Miami (Miami Gardens)" },
  { round: "Final", num: 104, date: "2026-07-19", time: "15:00 UTC-4", team1: "W101", team2: "W102", ground: "New York/New Jersey (East Rutherford)" },
];

export const BRACKET_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Match for third place",
  "Final",
];

const KNOCKOUT_NUMBERS = new Set(KNOCKOUT_MATCHES.map((match) => match.num));

function isRealTeam(team) {
  return Boolean(team && !team.isPlaceholder && team.id && team.id !== "tbd");
}

function getMatchNumber(match = {}) {
  if (Number.isFinite(match.num)) return match.num;
  const idMatch = String(match.id || "").match(/(?:^|-)(\d+)$/);
  const number = Number(idMatch?.[1]);
  return Number.isFinite(number) ? number : null;
}

function parseTemplateKickoff(template) {
  const [year, month, day] = template.date.split("-").map(Number);
  const timeMatch = template.time.match(/(\d{1,2}):(\d{2})\s+UTC([+-]\d+)?/i);
  const hour = Number(timeMatch?.[1] || 0);
  const minute = Number(timeMatch?.[2] || 0);
  const offset = Number(timeMatch?.[3] || 0);
  return new Date(Date.UTC(year, month - 1, day, hour - offset, minute)).toISOString();
}

function getGroupLetter(match = {}) {
  const stageMatch = String(match.stage || "").match(/^Group\s+([A-L])/i);
  if (stageMatch) return stageMatch[1].toUpperCase();
  const group = String(match.group || match.homeTeam?.group || match.awayTeam?.group || "").trim().toUpperCase();
  return /^[A-L]$/.test(group) ? group : "";
}

function createStanding(team) {
  return {
    team,
    played: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
  };
}

function addTeamStat(stats, team) {
  if (!isRealTeam(team)) return null;
  if (!stats.has(team.id)) stats.set(team.id, createStanding(team));
  return stats.get(team.id);
}

function compareStanding(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

function compareThirdPlace(a, b) {
  const standing = compareStanding(a, b);
  if (standing !== 0) return standing;
  return a.group.localeCompare(b.group);
}

function isFinalWithScores(match = {}) {
  return (
    match.status === "final"
    && Number.isFinite(Number(match.homeScore))
    && Number.isFinite(Number(match.awayScore))
  );
}

function getWinnerLoser(match = {}) {
  if (!isFinalWithScores(match)) {
    return { winner: null, loser: null };
  }

  if (match.winnerId && match.loserId) {
    const homeWon = match.homeTeam?.id === match.winnerId;
    const awayWon = match.awayTeam?.id === match.winnerId;

    if (homeWon || awayWon) {
      return {
        winner: homeWon ? match.homeTeam : match.awayTeam,
        loser: homeWon ? match.awayTeam : match.homeTeam,
      };
    }
  }

  if (Number(match.homeScore) === Number(match.awayScore)) {
    return { winner: null, loser: null };
  }

  const homeWon = Number(match.homeScore) > Number(match.awayScore);
  return {
    winner: homeWon ? match.homeTeam : match.awayTeam,
    loser: homeWon ? match.awayTeam : match.homeTeam,
  };
}

function formatScore(match = {}) {
  if (!isFinalWithScores(match) && match.status !== "live") return "";
  return `${match.homeScore ?? "-"}-${match.awayScore ?? "-"}`;
}

function buildGroupData(matches = []) {
  const groupMatches = new Map();

  for (const match of matches) {
    const group = getGroupLetter(match);
    if (!group || !String(match.stage || "").toLowerCase().startsWith("group")) continue;
    if (!groupMatches.has(group)) groupMatches.set(group, []);
    groupMatches.get(group).push(match);
  }

  const seedMap = new Map();
  const thirdPlace = [];
  const groups = [];

  for (const [group, groupList] of groupMatches.entries()) {
    const stats = new Map();
    let finalCount = 0;
    let latestFinalKickoff = null;

    for (const match of groupList) {
      addTeamStat(stats, match.homeTeam);
      addTeamStat(stats, match.awayTeam);

      if (!isFinalWithScores(match) || !isRealTeam(match.homeTeam) || !isRealTeam(match.awayTeam)) continue;

      finalCount += 1;
      const home = addTeamStat(stats, match.homeTeam);
      const away = addTeamStat(stats, match.awayTeam);
      const homeScore = Number(match.homeScore);
      const awayScore = Number(match.awayScore);
      home.played += 1;
      away.played += 1;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;
      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;

      if (homeScore > awayScore) {
        home.points += 3;
      } else if (awayScore > homeScore) {
        away.points += 3;
      } else {
        home.points += 1;
        away.points += 1;
      }

      const kickoff = new Date(match.kickoff).getTime();
      if (Number.isFinite(kickoff) && (!latestFinalKickoff || kickoff > latestFinalKickoff)) {
        latestFinalKickoff = kickoff;
      }
    }

    const rankings = [...stats.values()].sort(compareStanding);
    const isComplete = groupList.length >= 6 && finalCount >= groupList.length && rankings.length >= 4;

    if (isComplete) {
      rankings.slice(0, 3).forEach((entry, index) => {
        seedMap.set(`${index + 1}${group}`, {
          team: entry.team,
          label: `${index + 1}${group}`,
          source: "group",
        });
      });

      if (rankings[2]) thirdPlace.push({ ...rankings[2], group });
    }

    groups.push({
      group,
      isComplete,
      latestFinalKickoff,
      rankings,
    });
  }

  const qualifiedThirdGroups = new Set(thirdPlace.sort(compareThirdPlace).slice(0, 8).map((entry) => entry.group));
  const eliminated = [];

  for (const group of groups) {
    if (!group.isComplete) continue;

    group.rankings.forEach((entry, index) => {
      const rank = index + 1;
      const advances = rank <= 2 || (rank === 3 && qualifiedThirdGroups.has(group.group));
      if (advances) return;

      eliminated.push({
        id: `group-${group.group}-${entry.team.id}`,
        team: entry.team,
        stage: `Group ${group.group}`,
        eliminatedBy: "Group standings",
        date: group.latestFinalKickoff ? new Date(group.latestFinalKickoff).toISOString() : null,
        score: `${entry.points} pts`,
        matchNumber: null,
      });
    });
  }

  return { seedMap, eliminated };
}

function formatSlotLabel(slot) {
  const winner = slot.match(/^W(\d+)$/i);
  if (winner) return `Winner ${winner[1]}`;

  const loser = slot.match(/^L(\d+)$/i);
  if (loser) return `Loser ${loser[1]}`;

  return slot.replace(/^([123])([A-L](?:\/[A-L])*)$/i, "$1 $2");
}

function resolveSlot(slot, actualTeam, context) {
  if (isRealTeam(actualTeam)) {
    return {
      kind: "team",
      label: actualTeam.name,
      seed: slot,
      status: "official",
      team: actualTeam,
    };
  }

  const winner = slot.match(/^W(\d+)$/i);
  if (winner) {
    const team = context.winners.get(Number(winner[1]));
    if (team) return { kind: "team", label: team.name, seed: slot, status: "advanced", team };
  }

  const loser = slot.match(/^L(\d+)$/i);
  if (loser) {
    const team = context.losers.get(Number(loser[1]));
    if (team) return { kind: "team", label: team.name, seed: slot, status: "placed", team };
  }

  const exactSeed = context.seeds.get(slot);
  if (exactSeed?.team) {
    return {
      kind: "team",
      label: exactSeed.team.name,
      seed: slot,
      status: exactSeed.source,
      team: exactSeed.team,
    };
  }

  return {
    kind: "seed",
    label: formatSlotLabel(slot),
    seed: slot,
    status: "pending",
    team: null,
  };
}

function buildMatchIndex(matches = []) {
  const index = new Map();

  for (const match of matches) {
    const number = getMatchNumber(match);
    if (!KNOCKOUT_NUMBERS.has(number)) continue;
    index.set(number, match);
  }

  return index;
}

function getTeamEliminationDate(existing, next) {
  const existingDate = existing?.date ? new Date(existing.date).getTime() : 0;
  const nextDate = next?.date ? new Date(next.date).getTime() : 0;
  return nextDate >= existingDate ? next : existing;
}

export function buildBracket(matches = [], externalEliminations = []) {
  const matchIndex = buildMatchIndex(matches);
  const groupData = buildGroupData(matches);
  const winners = new Map();
  const losers = new Map();
  const eliminatedByTeam = new Map(groupData.eliminated.map((entry) => [entry.team.id, entry]));

  for (const elimination of externalEliminations) {
    if (!isRealTeam(elimination.team)) continue;
    eliminatedByTeam.set(
      elimination.team.id,
      getTeamEliminationDate(eliminatedByTeam.get(elimination.team.id), elimination),
    );
  }

  for (const template of KNOCKOUT_MATCHES) {
    const actual = matchIndex.get(template.num);
    const result = getWinnerLoser(actual);

    if (isRealTeam(result.winner)) winners.set(template.num, result.winner);
    if (isRealTeam(result.loser)) {
      losers.set(template.num, result.loser);
      const elimination = {
        id: `ko-${template.num}-${result.loser.id}`,
        team: result.loser,
        stage: template.round,
        eliminatedBy: result.winner.name,
        date: actual.kickoff || parseTemplateKickoff(template),
        score: formatScore(actual),
        matchNumber: template.num,
      };
      eliminatedByTeam.set(result.loser.id, getTeamEliminationDate(eliminatedByTeam.get(result.loser.id), elimination));
    }
  }

  const context = {
    seeds: groupData.seedMap,
    winners,
    losers,
  };

  const bracketMatches = KNOCKOUT_MATCHES.map((template) => {
    const actual = matchIndex.get(template.num);
    const kickoff = actual?.kickoff || parseTemplateKickoff(template);
    const home = resolveSlot(template.team1, actual?.homeTeam, context);
    const away = resolveSlot(template.team2, actual?.awayTeam, context);
    const result = getWinnerLoser(actual);

    return {
      ...template,
      id: actual?.id || `wc26-${template.num}`,
      kickoff,
      venue: actual?.venue || template.ground,
      status: actual?.status || "upcoming",
      statusText: actual?.statusText || "",
      homeScore: actual?.homeScore ?? null,
      awayScore: actual?.awayScore ?? null,
      home,
      away,
      winnerId: result.winner?.id || null,
      loserId: result.loser?.id || null,
    };
  });

  const rounds = BRACKET_ROUNDS.map((round) => ({
    name: round,
    matches: bracketMatches.filter((match) => match.round === round),
  }));

  const eliminated = [...eliminatedByTeam.values()]
    .filter((entry) => isRealTeam(entry.team))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const nextMatch = bracketMatches
    .filter((match) => match.status !== "final")
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))[0] || null;

  return {
    rounds,
    eliminated,
    stats: {
      remainingTeams: Math.max(0, 48 - new Set(eliminated.map((entry) => entry.team.id)).size),
      completedKnockouts: bracketMatches.filter((match) => match.status === "final").length,
      totalKnockouts: bracketMatches.length,
      nextMatch,
    },
  };
}
