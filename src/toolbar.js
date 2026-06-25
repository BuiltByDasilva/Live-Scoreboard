import { getMatchFreshness } from "./live-data.js";
import { findNextMatch } from "./match-order.js";

function getToolbarTeamLabel(team) {
  return team?.code || team?.name || "TBD";
}

export function chooseToolbarMatch(matches, state) {
  const pinned = matches.find((match) => match.id === state.toolbarMatchId);
  if (pinned) return pinned;

  const watchedLive = matches.find((match) => (
    match.status === "live" && state.watchedMatchIds.includes(match.id)
  ));
  return watchedLive || matches.find((match) => match.status === "live") || null;
}

export function getToolbarPresentation(snapshot, state, now = Date.now()) {
  const matches = snapshot.matches || [];
  const selected = chooseToolbarMatch(matches, state);
  const liveCount = matches.filter((match) => match.status === "live").length;

  if (!selected) {
    const next = findNextMatch(matches, now);
    return {
      badgeText: "",
      badgeColor: "#252925",
      title: next
        ? `Next: ${next.homeTeam.name || "TBD"} vs ${next.awayTeam.name || "TBD"} · ${new Date(next.kickoff).toLocaleString()}`
        : "Live Scoreboard · No live matches",
    };
  }

  if (selected.status === "live") {
    const score = `${selected.homeScore ?? 0}-${selected.awayScore ?? 0}`;
    const minute = selected.minute ? `${selected.minute}'` : selected.statusText;
    const moreLive = liveCount > 1 ? ` · +${liveCount - 1} more live` : "";
    return {
      badgeText: score.slice(0, 4),
      badgeColor: snapshot.stale ? "#d39b21" : "#ff5d4d",
      title: `${getToolbarTeamLabel(selected.homeTeam)} ${score} ${getToolbarTeamLabel(selected.awayTeam)} · ${minute}${moreLive} · ${getMatchFreshness(snapshot, now)}`,
    };
  }

  if (selected.status === "final") {
    return {
      badgeText: "FT",
      badgeColor: "#252925",
      title: `${getToolbarTeamLabel(selected.homeTeam)} ${selected.homeScore}-${selected.awayScore} ${getToolbarTeamLabel(selected.awayTeam)} · Full time`,
    };
  }

  const minutesAway = Math.round((new Date(selected.kickoff).getTime() - now) / 60000);
  return {
    badgeText: minutesAway >= 0 && minutesAway <= 60 ? `${minutesAway}m` : "",
    badgeColor: "#b8ff16",
    title: `${selected.homeTeam.name || "TBD"} vs ${selected.awayTeam.name || "TBD"} · ${new Date(selected.kickoff).toLocaleString()}`,
  };
}
