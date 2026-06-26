import { getMatchFreshness } from "./live-data.js";
import { findNextMatch } from "./match-order.js";

const ICON_SIZES = [16, 32, 48, 128];

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
      iconMatch: next || null,
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
      iconMatch: selected,
    };
  }

  if (selected.status === "final") {
    return {
      badgeText: "FT",
      badgeColor: "#252925",
      title: `${getToolbarTeamLabel(selected.homeTeam)} ${selected.homeScore}-${selected.awayScore} ${getToolbarTeamLabel(selected.awayTeam)} · Full time`,
      iconMatch: selected,
    };
  }

  const minutesAway = Math.round((new Date(selected.kickoff).getTime() - now) / 60000);
  return {
    badgeText: minutesAway >= 0 && minutesAway <= 60 ? `${minutesAway}m` : "",
    badgeColor: "#b8ff16",
    title: `${selected.homeTeam.name || "TBD"} vs ${selected.awayTeam.name || "TBD"} · ${new Date(selected.kickoff).toLocaleString()}`,
    iconMatch: selected,
  };
}

function getTeamColors(team) {
  const colors = Array.isArray(team?.colors) && team.colors.length
    ? team.colors
    : ["#082e4d", "#f7e9bd", "#00eaff"];
  return colors.slice(0, 3);
}

function drawFlagPanel(context, x, y, width, height, colors, direction = "vertical") {
  const stops = colors.length || 1;
  colors.forEach((color, index) => {
    context.fillStyle = color;
    if (direction === "horizontal") {
      const stripeHeight = height / stops;
      context.fillRect(x, y + index * stripeHeight, width, stripeHeight + 1);
      return;
    }

    const stripeWidth = width / stops;
    context.fillRect(x + index * stripeWidth, y, stripeWidth + 1, height);
  });
}

function roundedRect(context, x, y, width, height, radius) {
  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
    return;
  }

  const right = x + width;
  const bottom = y + height;
  context.moveTo(x + radius, y);
  context.lineTo(right - radius, y);
  context.quadraticCurveTo(right, y, right, y + radius);
  context.lineTo(right, bottom - radius);
  context.quadraticCurveTo(right, bottom, right - radius, bottom);
  context.lineTo(x + radius, bottom);
  context.quadraticCurveTo(x, bottom, x, bottom - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
}

function drawToolbarIcon(size, match) {
  if (typeof OffscreenCanvas === "undefined") return null;

  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d");
  if (!context) return null;

  const homeColors = getTeamColors(match?.homeTeam);
  const awayColors = getTeamColors(match?.awayTeam);
  const pad = Math.max(1, Math.round(size * 0.08));
  const inner = size - pad * 2;
  const radius = Math.max(3, Math.round(size * 0.18));

  context.clearRect(0, 0, size, size);
  context.fillStyle = "#031b2b";
  context.beginPath();
  roundedRect(context, 0, 0, size, size, radius);
  context.fill();

  context.save();
  context.beginPath();
  roundedRect(context, pad, pad, inner, inner, Math.max(2, radius - 1));
  context.clip();

  drawFlagPanel(context, pad, pad, inner / 2, inner, homeColors, "horizontal");
  drawFlagPanel(context, pad + inner / 2, pad, inner / 2, inner, awayColors, "vertical");

  context.fillStyle = "rgba(0, 234, 255, 0.18)";
  context.fillRect(pad, pad, inner, inner);
  context.fillStyle = "rgba(3, 27, 43, 0.28)";
  context.fillRect(pad + inner / 2 - 1, pad, 2, inner);
  context.restore();

  context.strokeStyle = "#00eaff";
  context.lineWidth = Math.max(1, Math.round(size * 0.05));
  context.beginPath();
  roundedRect(context, pad, pad, inner, inner, Math.max(2, radius - 1));
  context.stroke();

  context.fillStyle = "#fff7d3";
  context.beginPath();
  context.arc(size / 2, size / 2, Math.max(2, size * 0.13), 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#082e4d";
  context.lineWidth = Math.max(1, Math.round(size * 0.025));
  context.stroke();

  return context.getImageData(0, 0, size, size);
}

export function getToolbarIconImageData(match) {
  if (!match) return null;

  const imageData = {};
  for (const size of ICON_SIZES) {
    const icon = drawToolbarIcon(size, match);
    if (icon) imageData[size] = icon;
  }

  return Object.keys(imageData).length ? imageData : null;
}
