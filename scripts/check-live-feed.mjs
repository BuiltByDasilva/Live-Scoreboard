import { refreshLiveSnapshot } from "../src/live-data.js";
import fs from "node:fs/promises";

const schedule = JSON.parse(await fs.readFile(
  new URL("../assets/data/worldcup-2026.json", import.meta.url),
  "utf8",
));

const fetchWithBundledSchedule = (url, options) => (
  String(url).startsWith("file:")
    ? Promise.resolve({ ok: true, json: async () => schedule })
    : fetch(url, options)
);

const snapshot = await refreshLiveSnapshot({ fetchImpl: fetchWithBundledSchedule });
const live = snapshot.matches.filter((match) => match.status === "live");
const upcoming = snapshot.matches.filter((match) => match.status === "upcoming");
const final = snapshot.matches.filter((match) => match.status === "final");

if (!snapshot.matches.length) {
  throw new Error("The live-score pipeline returned no matches.");
}

console.log(JSON.stringify({
  provider: snapshot.provider,
  fetchedAt: snapshot.fetchedAt,
  stale: snapshot.stale,
  counts: {
    live: live.length,
    upcoming: upcoming.length,
    final: final.length,
  },
  nextMatch: upcoming[0]
    ? `${upcoming[0].homeTeam.name} vs ${upcoming[0].awayTeam.name}`
    : null,
}, null, 2));
