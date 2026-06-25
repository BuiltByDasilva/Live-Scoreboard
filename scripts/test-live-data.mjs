import assert from "node:assert/strict";
import {
  didScoreChange,
  parseEspnMatches,
  refreshLiveSnapshot,
} from "../src/live-data.js";
import { findNextMatch, getOrderedMatches, getTeamIdsInMatchOrder } from "../src/match-order.js";
import { getToolbarPresentation } from "../src/toolbar.js";

const espnPayload = {
  events: [{
    id: "test-1",
    date: "2026-06-22T17:00:00Z",
    status: { type: { state: "in", completed: false } },
    competitions: [{
      date: "2026-06-22T17:00:00Z",
      status: {
        displayClock: "78'",
        type: { state: "in", completed: false, shortDetail: "78'" },
      },
      venue: { fullName: "Test Stadium" },
      competitors: [
        { homeAway: "home", score: "2", team: { abbreviation: "ARG", displayName: "Argentina" } },
        { homeAway: "away", score: "1", team: { abbreviation: "AUT", displayName: "Austria" } },
      ],
    }],
  }],
};

const openFootballPayload = {
  name: "World Cup 2026",
  matches: [{
    round: "Matchday 12",
    date: "2026-06-22",
    time: "13:00 UTC-4",
    team1: "Argentina",
    team2: "Austria",
    group: "Group J",
    ground: "Test Stadium",
  }],
};

const parsed = parseEspnMatches(espnPayload);
assert.equal(parsed.length, 1);
assert.equal(parsed[0].status, "live");
assert.equal(parsed[0].minute, 78);
assert.equal(parsed[0].homeTeam.id, "arg");
assert.equal(parsed[0].awayTeam.id, "aut");

const merged = await refreshLiveSnapshot({
  fetchImpl: async (url) => ({
    ok: true,
    json: async () => url.includes("assets/data") ? openFootballPayload : espnPayload,
  }),
});
assert.equal(merged.matches.length, 1);
assert.equal(merged.matches[0].id, "wc26-2026-06-22-1");
assert.equal(merged.matches[0].status, "live");

const liveToolbar = getToolbarPresentation(merged, {
  toolbarMatchId: merged.matches[0].id,
  watchedMatchIds: [],
}, new Date(merged.fetchedAt).getTime());
assert.equal(liveToolbar.badgeText, "2-1");
assert.match(liveToolbar.title, /ARG 2-1 AUT.*78'/);

const finalToolbar = getToolbarPresentation({
  ...merged,
  matches: [{ ...merged.matches[0], status: "final" }],
}, {
  toolbarMatchId: merged.matches[0].id,
  watchedMatchIds: [],
});
assert.equal(finalToolbar.badgeText, "FT");

const soonKickoff = new Date("2026-06-22T18:00:00Z").getTime();
const soonToolbar = getToolbarPresentation({
  ...merged,
  matches: [{ ...merged.matches[0], status: "upcoming", kickoff: new Date(soonKickoff).toISOString() }],
}, {
  toolbarMatchId: merged.matches[0].id,
  watchedMatchIds: [],
}, soonKickoff - (45 * 60000));
assert.equal(soonToolbar.badgeText, "45m");

const previous = { matches: [{ ...merged.matches[0], homeScore: 1 }] };
assert.equal(didScoreChange(previous, merged), true);

const fallback = await refreshLiveSnapshot({
  fetchImpl: async (url) => {
    if (url.includes("assets/data")) {
      return { ok: true, json: async () => openFootballPayload };
    }
    throw new Error("Primary unavailable");
  },
});
assert.equal(fallback.stale, true);
assert.equal(fallback.matches[0].status, "upcoming");

const offline = await refreshLiveSnapshot({
  fetchImpl: async () => { throw new Error("Offline"); },
});
assert.equal(offline.degraded, true);
assert.equal(offline.matches.some((match) => match.status === "live"), false);

const nextOrderNow = new Date("2026-06-24T18:30:00Z").getTime();
const staleScheduled = {
  ...merged.matches[0],
  id: "stale-scheduled",
  home: "arg",
  away: "aut",
  homeTeam: { id: "arg", name: "Argentina", code: "ARG" },
  awayTeam: { id: "aut", name: "Austria", code: "AUT" },
  status: "upcoming",
  kickoff: "2026-06-22T18:00:00Z",
};
const nextScheduled = {
  ...merged.matches[0],
  id: "next-scheduled",
  home: "sui",
  away: "can",
  homeTeam: { id: "sui", name: "Switzerland", code: "SUI" },
  awayTeam: { id: "can", name: "Canada", code: "CAN" },
  status: "upcoming",
  kickoff: "2026-06-24T19:00:00Z",
};
const laterScheduled = {
  ...merged.matches[0],
  id: "later-scheduled",
  home: "sco",
  away: "bra",
  homeTeam: { id: "sco", name: "Scotland", code: "SCO" },
  awayTeam: { id: "bra", name: "Brazil", code: "BRA" },
  status: "upcoming",
  kickoff: "2026-06-24T22:00:00Z",
};
const ordered = getOrderedMatches([staleScheduled, laterScheduled, nextScheduled], nextOrderNow);
assert.deepEqual(ordered.map((match) => match.id), ["next-scheduled", "later-scheduled", "stale-scheduled"]);
assert.equal(findNextMatch([staleScheduled, nextScheduled], nextOrderNow).id, "next-scheduled");
assert.deepEqual(
  getTeamIdsInMatchOrder([staleScheduled, laterScheduled, nextScheduled], nextOrderNow).slice(0, 4),
  ["sui", "can", "sco", "bra"],
);

console.log("Live data parser, merge, goal detection, and outage fallbacks passed.");
