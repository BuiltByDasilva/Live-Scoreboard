import assert from "node:assert/strict";
import {
  didScoreChange,
  parseEspnMatches,
  refreshLiveSnapshot,
} from "../src/live-data.js";
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

console.log("Live data parser, merge, goal detection, and outage fallbacks passed.");
