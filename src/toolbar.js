import { getMatchFreshness } from "./live-data.js";
import { findNextMatch } from "./match-order.js";

const ICON_SIZES = [16, 32, 48, 128];

function getToolbarTeamLabel(team) {
  return team?.code || team?.name || "TBD";
}

function chooseLiveToolbarMatch(matches, state) {
  const pinnedLive = matches.find((match) => (
    match.id === state.toolbarMatchId && match.status === "live"
  ));
  if (pinnedLive) return pinnedLive;

  const watchedLive = matches.find((match) => (
    match.status === "live" && state.watchedMatchIds.includes(match.id)
  ));
  return watchedLive || matches.find((match) => match.status === "live") || null;
}

export function chooseToolbarMatch(matches, state) {
  const pinned = matches.find((match) => match.id === state.toolbarMatchId);
  if (pinned) return pinned;

  return chooseLiveToolbarMatch(matches, state);
}

function formatLiveBadgeScore(match) {
  const home = `${match.homeScore ?? 0}`;
  const away = `${match.awayScore ?? 0}`;
  const compact = `${home}-${away}`;
  if (compact.length <= 4) return compact;
  return `${home}:${away}`.slice(0, 4);
}

export function getToolbarPresentation(snapshot, state, now = Date.now()) {
  const matches = snapshot.matches || [];
  const liveSelected = chooseLiveToolbarMatch(matches, state);
  const selected = chooseToolbarMatch(matches, state);
  const liveCount = matches.filter((match) => match.status === "live").length;

  if (liveSelected) {
    const score = `${liveSelected.homeScore ?? 0}-${liveSelected.awayScore ?? 0}`;
    const minute = liveSelected.minute ? `${liveSelected.minute}'` : liveSelected.statusText;
    const moreLive = liveCount > 1 ? ` · +${liveCount - 1} more live` : "";
    return {
      badgeText: formatLiveBadgeScore(liveSelected),
      badgeColor: snapshot.stale ? "#d39b21" : "#ff5d4d",
      title: `${getToolbarTeamLabel(liveSelected.homeTeam)} ${score} ${getToolbarTeamLabel(liveSelected.awayTeam)} · ${minute}${moreLive} · ${getMatchFreshness(snapshot, now)}`,
      iconMatch: liveSelected,
    };
  }

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

function drawSoccerBall(context, cx, cy, radius) {
  context.save();

  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.clip();

  const seamWidth = Math.max(1.2, radius * 0.14);
  const outerPatchRadius = radius * 0.27;
  const centerPatchRadius = radius * 0.28;

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#eef6f8";
  context.beginPath();
  context.arc(cx - radius * 0.26, cy - radius * 0.28, radius * 0.74, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#111111";
  context.strokeStyle = "#2f3a3f";
  context.lineWidth = Math.max(1, seamWidth * 0.7);
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    const x = cx + Math.cos(angle) * centerPatchRadius;
    const y = cy + Math.sin(angle) * centerPatchRadius;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
  context.fill();

  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    const startX = cx + Math.cos(angle) * centerPatchRadius * 0.88;
    const startY = cy + Math.sin(angle) * centerPatchRadius * 0.88;
    const endX = cx + Math.cos(angle) * radius * 0.88;
    const endY = cy + Math.sin(angle) * radius * 0.88;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  }

  if (radius >= 12) {
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
      const patchCx = cx + Math.cos(angle) * radius * 0.76;
      const patchCy = cy + Math.sin(angle) * radius * 0.76;
      const rotation = angle + Math.PI;
      context.beginPath();
      for (let point = 0; point < 5; point += 1) {
        const pointAngle = rotation + (point * Math.PI * 2) / 5;
        const x = patchCx + Math.cos(pointAngle) * outerPatchRadius;
        const y = patchCy + Math.sin(pointAngle) * outerPatchRadius;
        if (point === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.closePath();
      context.fill();
    }
  }

  context.restore();

  context.save();
  context.strokeStyle = "#071014";
  context.lineWidth = Math.max(1.6, radius * 0.16);
  context.beginPath();
  context.arc(cx, cy, radius - context.lineWidth / 2, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = "#ffffff";
  context.lineWidth = Math.max(0.8, radius * 0.07);
  context.beginPath();
  context.arc(cx, cy, radius - context.lineWidth, 0, Math.PI * 2);
  context.stroke();

  if (radius >= 18) {
    context.strokeStyle = "rgba(0, 215, 255, 0.85)";
    context.lineWidth = Math.max(1, radius * 0.06);
    context.beginPath();
    context.arc(cx, cy, radius + context.lineWidth * 0.2, -Math.PI * 0.18, Math.PI * 1.14);
    context.stroke();
  }

  context.restore();
}

function drawToolbarIcon(size, match) {
  if (typeof OffscreenCanvas === "undefined") return null;

  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d");
  if (!context) return null;

  const center = size / 2;
  const ballRadius = Math.max(6, size * 0.44);

  context.clearRect(0, 0, size, size);
  drawSoccerBall(context, center, center, ballRadius);

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
