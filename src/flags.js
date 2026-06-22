const FLAG_ROOT = new URL("../assets/flags/", import.meta.url);

const FLAG_FILE_BY_TEAM_ID = {
  mex: "mx.svg",
  rsa: "za.svg",
  kor: "kr.svg",
  cze: "cz.svg",
  can: "ca.svg",
  qat: "qa.svg",
  sui: "ch.svg",
  bih: "ba.svg",
  bra: "br.svg",
  mar: "ma.svg",
  hai: "ht.svg",
  sco: "sco.svg",
  usa: "us.svg",
  aus: "au.svg",
  tur: "tr.svg",
  par: "py.svg",
  ger: "de.svg",
  cur: "cw.svg",
  civ: "ci.svg",
  ecu: "ec.svg",
  ned: "nl.svg",
  jpn: "jp.svg",
  swe: "se.svg",
  tun: "tn.svg",
  bel: "be.svg",
  egy: "eg.svg",
  irn: "ir.svg",
  nzl: "nz.svg",
  esp: "es.svg",
  cpv: "cv.svg",
  ksa: "sa.svg",
  uru: "uy.svg",
  fra: "fr.svg",
  sen: "sn.svg",
  irq: "iq.svg",
  nor: "no.svg",
  arg: "ar.svg",
  aut: "at.svg",
  alg: "dz.svg",
  jor: "jo.svg",
  por: "pt.svg",
  cod: "cd.svg",
  uzb: "uz.svg",
  col: "co.svg",
  eng: "eng.svg",
  cro: "hr.svg",
  gha: "gh.svg",
  pan: "pa.svg",
};

const LOCATION_FLAG_FILE_BY_NAME = {
  canada: "ca.svg",
  mexico: "mx.svg",
  "united states": "us.svg",
};

export const PLACEHOLDER_FLAG_URL = new URL("question.svg", FLAG_ROOT).href;

function makeFlagUrl(fileName) {
  return new URL(fileName, FLAG_ROOT).href;
}

export function isPlaceholderTeamLabel(value = "") {
  if (value == null) return true;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === "tbd" || normalized === "tbc" || normalized === "to be determined") return true;
  if (/^winner of\b/.test(normalized) || /^runner[- ]up\b/.test(normalized)) return true;
  if (/^group [a-l]\b/.test(normalized)) return true;
  if (/^\d+[a-z]$/.test(normalized)) return true;
  if (/^\d+[a-z](?:\/[a-z])+$/i.test(normalized)) return true;
  return false;
}

export function getTeamFlagUrl(teamId) {
  const fileName = FLAG_FILE_BY_TEAM_ID[String(teamId || "").toLowerCase()];
  return fileName ? makeFlagUrl(fileName) : PLACEHOLDER_FLAG_URL;
}

export function getLocationFlagUrl(countryName) {
  const fileName = LOCATION_FLAG_FILE_BY_NAME[String(countryName || "").trim().toLowerCase()];
  return fileName ? makeFlagUrl(fileName) : PLACEHOLDER_FLAG_URL;
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
