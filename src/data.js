import { createPlaceholderTeam, getTeamFlagUrl, isPlaceholderTeamLabel } from "./flags.js";

function enrichTeam(team) {
  if (!team) {
    return createPlaceholderTeam();
  }

  if (isPlaceholderTeamLabel(team.name) || team.id === "tbd") {
    return createPlaceholderTeam();
  }

  return {
    ...team,
    flagUrl: getTeamFlagUrl(team.id),
  };
}
export const TEAMS = [
  { id: "mex", group: "A", name: "Mexico", code: "MEX", colors: ["#006847", "#ffffff", "#ce1126"] },
  { id: "rsa", group: "A", name: "South Africa", code: "RSA", colors: ["#007a4d", "#ffb612", "#de3831"] },
  { id: "kor", group: "A", name: "Korea Republic", code: "KOR", colors: ["#ffffff", "#c60c30", "#003478"] },
  { id: "cze", group: "A", name: "Czechia", code: "CZE", colors: ["#d7141a", "#ffffff", "#11457e"] },
  { id: "can", group: "B", name: "Canada", code: "CAN", colors: ["#d80621", "#ffffff", "#a80d1e"] },
  { id: "qat", group: "B", name: "Qatar", code: "QAT", colors: ["#8a1538", "#ffffff", "#5b0f2b"] },
  { id: "sui", group: "B", name: "Switzerland", code: "SUI", colors: ["#d52b1e", "#ffffff", "#8f1d17"] },
  { id: "bih", group: "B", name: "Bosnia and Herzegovina", code: "BIH", colors: ["#002395", "#fecb00", "#ffffff"] },
  { id: "bra", group: "C", name: "Brazil", code: "BRA", colors: ["#009b3a", "#ffdf00", "#002776"] },
  { id: "mar", group: "C", name: "Morocco", code: "MAR", colors: ["#c1272d", "#006233", "#ffffff"] },
  { id: "hai", group: "C", name: "Haiti", code: "HAI", colors: ["#00209f", "#d21034", "#ffffff"] },
  { id: "sco", group: "C", name: "Scotland", code: "SCO", colors: ["#005eb8", "#ffffff", "#0b2e57"] },
  { id: "usa", group: "D", name: "United States", code: "USA", colors: ["#3c3b6e", "#ffffff", "#b22234"] },
  { id: "aus", group: "D", name: "Australia", code: "AUS", colors: ["#00843d", "#ffcd00", "#00205b"] },
  { id: "tur", group: "D", name: "Turkiye", code: "TUR", colors: ["#e30a17", "#ffffff", "#9d1018"] },
  { id: "par", group: "D", name: "Paraguay", code: "PAR", colors: ["#d52b1e", "#ffffff", "#0038a8"] },
  { id: "ger", group: "E", name: "Germany", code: "GER", colors: ["#000000", "#dd0000", "#ffce00"] },
  { id: "cur", group: "E", name: "Curacao", code: "CUR", colors: ["#002b7f", "#f9e814", "#ffffff"] },
  { id: "civ", group: "E", name: "Cote d'Ivoire", code: "CIV", colors: ["#f77f00", "#ffffff", "#009e60"] },
  { id: "ecu", group: "E", name: "Ecuador", code: "ECU", colors: ["#ffdd00", "#034ea2", "#ed1c24"] },
  { id: "ned", group: "F", name: "Netherlands", code: "NED", colors: ["#ff4f00", "#ffffff", "#21468b"] },
  { id: "jpn", group: "F", name: "Japan", code: "JPN", colors: ["#ffffff", "#bc002d", "#111111"] },
  { id: "swe", group: "F", name: "Sweden", code: "SWE", colors: ["#006aa7", "#fecc00", "#ffffff"] },
  { id: "tun", group: "F", name: "Tunisia", code: "TUN", colors: ["#e70013", "#ffffff", "#8d0010"] },
  { id: "bel", group: "G", name: "Belgium", code: "BEL", colors: ["#000000", "#fae042", "#ed2939"] },
  { id: "egy", group: "G", name: "Egypt", code: "EGY", colors: ["#ce1126", "#ffffff", "#000000"] },
  { id: "irn", group: "G", name: "IR Iran", code: "IRN", colors: ["#239f40", "#ffffff", "#da0000"] },
  { id: "nzl", group: "G", name: "New Zealand", code: "NZL", colors: ["#111111", "#ffffff", "#c8102e"] },
  { id: "esp", group: "H", name: "Spain", code: "ESP", colors: ["#aa151b", "#f1bf00", "#7a0c10"] },
  { id: "cpv", group: "H", name: "Cabo Verde", code: "CPV", colors: ["#003893", "#ffffff", "#cf2027"] },
  { id: "ksa", group: "H", name: "Saudi Arabia", code: "KSA", colors: ["#006c35", "#ffffff", "#003f21"] },
  { id: "uru", group: "H", name: "Uruguay", code: "URU", colors: ["#75aadb", "#ffffff", "#fcd116"] },
  { id: "fra", group: "I", name: "France", code: "FRA", colors: ["#0055a4", "#ffffff", "#ef4135"] },
  { id: "sen", group: "I", name: "Senegal", code: "SEN", colors: ["#00853f", "#fdef42", "#e31b23"] },
  { id: "irq", group: "I", name: "Iraq", code: "IRQ", colors: ["#ce1126", "#ffffff", "#000000"] },
  { id: "nor", group: "I", name: "Norway", code: "NOR", colors: ["#ba0c2f", "#ffffff", "#00205b"] },
  { id: "arg", group: "J", name: "Argentina", code: "ARG", colors: ["#74acdf", "#ffffff", "#f6b40e"] },
  { id: "aut", group: "J", name: "Austria", code: "AUT", colors: ["#ed2939", "#ffffff", "#9c1421"] },
  { id: "alg", group: "J", name: "Algeria", code: "ALG", colors: ["#006233", "#ffffff", "#d21034"] },
  { id: "jor", group: "J", name: "Jordan", code: "JOR", colors: ["#000000", "#ffffff", "#ce1126"] },
  { id: "por", group: "K", name: "Portugal", code: "POR", colors: ["#006600", "#ff0000", "#ffcc00"] },
  { id: "cod", group: "K", name: "Congo DR", code: "COD", colors: ["#007fff", "#f7d618", "#ce1021"] },
  { id: "uzb", group: "K", name: "Uzbekistan", code: "UZB", colors: ["#1eb5e5", "#ffffff", "#009b3a"] },
  { id: "col", group: "K", name: "Colombia", code: "COL", colors: ["#fcd116", "#003893", "#ce1126"] },
  { id: "eng", group: "L", name: "England", code: "ENG", colors: ["#ffffff", "#cf142b", "#00247d"] },
  { id: "cro", group: "L", name: "Croatia", code: "CRO", colors: ["#f00000", "#ffffff", "#171796"] },
  { id: "gha", group: "L", name: "Ghana", code: "GHA", colors: ["#ce1126", "#fcd116", "#006b3f"] },
  { id: "pan", group: "L", name: "Panama", code: "PAN", colors: ["#005293", "#ffffff", "#d21034"] }
];

export const MATCHES = [
  { id: "g-i-03", group: "I", stage: "Group I", home: "nor", away: "sen", status: "live", minute: 68, homeScore: 1, awayScore: 1, kickoff: "2026-06-22T14:00:00-04:00", venue: "New York New Jersey Stadium" },
  { id: "g-i-04", group: "I", stage: "Group I", home: "fra", away: "irq", status: "live", minute: 52, homeScore: 2, awayScore: 0, kickoff: "2026-06-22T17:00:00-04:00", venue: "Philadelphia Stadium" },
  { id: "g-j-03", group: "J", stage: "Group J", home: "arg", away: "aut", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-22T20:00:00-04:00", venue: "Dallas Stadium" },
  { id: "g-j-04", group: "J", stage: "Group J", home: "jor", away: "alg", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-22T23:00:00-04:00", venue: "San Francisco Bay Area Stadium" },
  { id: "g-l-03", group: "L", stage: "Group L", home: "eng", away: "gha", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-23T14:00:00-04:00", venue: "Boston Stadium" },
  { id: "g-l-04", group: "L", stage: "Group L", home: "pan", away: "cro", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-23T17:00:00-04:00", venue: "Toronto Stadium" },
  { id: "g-k-03", group: "K", stage: "Group K", home: "por", away: "uzb", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-23T20:00:00-04:00", venue: "Houston Stadium" },
  { id: "g-k-04", group: "K", stage: "Group K", home: "col", away: "cod", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-23T23:00:00-04:00", venue: "Estadio Guadalajara" },
  { id: "g-c-05", group: "C", stage: "Group C", home: "sco", away: "bra", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-24T14:00:00-04:00", venue: "Miami Stadium" },
  { id: "g-c-06", group: "C", stage: "Group C", home: "mar", away: "hai", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-24T14:00:00-04:00", venue: "Atlanta Stadium" },
  { id: "g-b-05", group: "B", stage: "Group B", home: "sui", away: "can", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-24T18:00:00-04:00", venue: "BC Place Vancouver" },
  { id: "g-b-06", group: "B", stage: "Group B", home: "bih", away: "qat", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-24T18:00:00-04:00", venue: "Seattle Stadium" },
  { id: "g-a-05", group: "A", stage: "Group A", home: "cze", away: "mex", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-24T22:00:00-04:00", venue: "Mexico City Stadium" },
  { id: "g-a-06", group: "A", stage: "Group A", home: "rsa", away: "kor", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-24T22:00:00-04:00", venue: "Estadio Monterrey" },
  { id: "g-e-05", group: "E", stage: "Group E", home: "cur", away: "civ", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-25T14:00:00-04:00", venue: "Philadelphia Stadium" },
  { id: "g-e-06", group: "E", stage: "Group E", home: "ecu", away: "ger", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-25T14:00:00-04:00", venue: "New York New Jersey Stadium" },
  { id: "g-f-05", group: "F", stage: "Group F", home: "jpn", away: "swe", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-25T18:00:00-04:00", venue: "Dallas Stadium" },
  { id: "g-f-06", group: "F", stage: "Group F", home: "tun", away: "ned", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-25T18:00:00-04:00", venue: "Kansas City Stadium" },
  { id: "g-d-05", group: "D", stage: "Group D", home: "tur", away: "usa", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-25T22:00:00-04:00", venue: "Los Angeles Stadium" },
  { id: "g-d-06", group: "D", stage: "Group D", home: "par", away: "aus", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-25T22:00:00-04:00", venue: "San Francisco Bay Area Stadium" },
  { id: "g-g-05", group: "G", stage: "Group G", home: "egy", away: "irn", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-26T18:00:00-04:00", venue: "Seattle Stadium" },
  { id: "g-g-06", group: "G", stage: "Group G", home: "nzl", away: "bel", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-26T18:00:00-04:00", venue: "BC Place Vancouver" },
  { id: "g-h-05", group: "H", stage: "Group H", home: "cpv", away: "ksa", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-26T22:00:00-04:00", venue: "Houston Stadium" },
  { id: "g-h-06", group: "H", stage: "Group H", home: "uru", away: "esp", status: "upcoming", minute: null, homeScore: null, awayScore: null, kickoff: "2026-06-26T22:00:00-04:00", venue: "Estadio Guadalajara" }
];

export function getTeam(teamId) {
  return enrichTeam(TEAMS.find((team) => team.id === teamId));
}

export function decorateTeam(team) {
  return enrichTeam(team);
}

export function getDecoratedMatches() {
  return MATCHES.map((match) => ({
    ...match,
    homeTeam: getTeam(match.home),
    awayTeam: getTeam(match.away)
  }));
}
