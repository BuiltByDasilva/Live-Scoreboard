const FLAG_ROOT = new URL("../assets/flags/", import.meta.url);

const LOCATION_FLAG_FILE_BY_NAME = {
  canada: "can.svg",
  mexico: "mex.svg",
  "united states": "usa.svg",
};

export const PLACEHOLDER_FLAG_URL = new URL("question.svg", FLAG_ROOT).href;

function makeFlagUrl(fileName) {
  return new URL(fileName, FLAG_ROOT).href;
}

function isKnownTeamId(teamId = "") {
  const normalized = String(teamId).trim().toLowerCase();
  if (!normalized || normalized === "tbd") return false;
  return /^[a-z]{3}$/.test(normalized);
}

export function isPlaceholderTeamLabel(value = "") {
  if (value == null) return true;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === "tbd" || normalized === "tbc" || normalized === "to be determined") return true;
  if (/^(?:w|l)\d+$/i.test(normalized)) return true;
  if (/^(?:first|second|third|fourth)\s+place\b/.test(normalized)) return true;
  if (/^round\b/.test(normalized)) return true;
  if (/^[1-3][a-z](?:\/[a-z]+)*$/i.test(normalized)) return true;
  if (/^(?:group|winner|runner|loser)\b/.test(normalized)) return true;
  if (/^winner of\b/.test(normalized) || /^runner[- ]up\b/.test(normalized)) return true;
  if (/^group [a-l]\b/.test(normalized)) return true;
  if (/^\d+[a-z]$/.test(normalized)) return true;
  if (/^\d+[a-z](?:\/[a-z])+$/i.test(normalized)) return true;
  return false;
}

export function getTeamFlagUrl(teamId) {
  const normalized = String(teamId || "").trim().toLowerCase();
  if (!isKnownTeamId(normalized)) return PLACEHOLDER_FLAG_URL;
  return makeFlagUrl(`${normalized}.svg`);
}

export function getLocationFlagUrl(countryName) {
  const fileName = LOCATION_FLAG_FILE_BY_NAME[String(countryName || "").trim().toLowerCase()];
  return fileName ? makeFlagUrl(fileName) : null;
}

export function createPlaceholderTeam() {
  return {
    id: "tbd",
    group: "",
    name: "TBD",
    code: "TBD",
    colors: ["#64748b", "#f8fafc", "#334155"],
    flagUrl: PLACEHOLDER_FLAG_URL,
    isPlaceholder: true,
  };
}
