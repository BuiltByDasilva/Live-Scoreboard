import { TEAMS } from "./data.js";

const THEME_STORIES = {
  mex: ["Sunlit Papel", "paper-cut celebration", "papel", "Joyful cut-paper geometry and marigold warmth."],
  rsa: ["Ubuntu Mosaic", "many colors, one rhythm", "mosaic", "Interlocking shapes celebrate community and shared energy."],
  kor: ["Hanji Orbit", "soft paper in motion", "orbit", "Layered paper circles balance calm, play, and motion."],
  cze: ["Bohemian Crystal", "faceted light", "crystal", "Prismatic facets echo a long tradition of decorative glass."],
  can: ["Northern Glow", "lakes under bright skies", "aurora", "Broad ribbons of light drift above a clear northern horizon."],
  qat: ["Pearl Dunes", "desert pearl shimmer", "dunes", "Pearl-like circles and sweeping dunes create a warm nightscape."],
  sui: ["Alpine Fold", "paper peaks", "alpine", "Crisp folded peaks make every score feel mountain-clear."],
  bih: ["River Bridge", "arches over blue water", "bridge", "Gentle arches and river lines honor connection across landscapes."],
  bra: ["Canopy Carnival", "tropical rhythm", "canopy", "Leafy arcs and sunny beats bring a playful festival pulse."],
  mar: ["Zellige Garden", "star-tile geometry", "zellige", "Original geometric tiles create a garden of repeating color."],
  hai: ["Lakou Sunrise", "courtyard warmth", "sun", "Radiant courtyard-inspired forms celebrate gathering and renewal."],
  sco: ["Highland Loom", "woven hills", "tartan", "Original woven bands meet misty, rolling highland shapes."],
  usa: ["Roadtrip Stars", "open-road sparkle", "stars", "Friendly stars and long horizon lines evoke a summer road trip."],
  aus: ["Reef Dream", "coral currents", "reef", "Bubbly coral forms and ocean currents create an underwater playground."],
  tur: ["Anatolian Tulip", "garden silhouette", "tulip", "Stylized tulips and curved tiles create a bright garden rhythm."],
  par: ["Ñandutí Breeze", "radiant lace", "lace", "Sun-wheel lace geometry is reimagined as a light, airy pattern."],
  ger: ["Bauhaus Beat", "shapes in tempo", "bauhaus", "Primary geometry and precise rhythm make scores feel musical."],
  cur: ["Island Breeze", "sun over sea", "breeze", "Trade-wind curves and bright water lines keep the panel buoyant."],
  civ: ["Lagoon Weave", "coastal color", "lagoon", "Woven bands flow into lagoon curves with warm, welcoming contrast."],
  ecu: ["Andean Sun", "mountain rays", "rays", "Highland peaks meet strong sun rays in a bold paper-cut scene."],
  ned: ["Tulip Current", "flowers on the move", "current", "Petal forms travel in tidy rows like a cheerful color current."],
  jpn: ["Rising Ripple", "quiet wave rhythm", "ripples", "Concentric water lines and a single sunrise keep focus serene."],
  swe: ["Midsummer Meadow", "flowers and daylight", "meadow", "Tiny geometric blooms dance beneath a long summer sky."],
  tun: ["Jasmine Mosaic", "flowers in tile", "jasmine", "Jasmine-like petals nest inside crisp Mediterranean geometry."],
  bel: ["Comic Spark", "panels of energy", "comic", "Bold dots and energetic frames add playful graphic-book motion."],
  egy: ["Nile Paper", "river and reed", "papyrus", "Layered reeds and a winding river form a friendly paper landscape."],
  irn: ["Garden Arch", "courtyard geometry", "arch", "Original arch and garden geometry creates a calm, jewel-like frame."],
  nzl: ["Southern Night", "stars over the ocean", "night", "A deep-sky trail glides above rolling Pacific waves."],
  esp: ["Fiesta Tiles", "sunny ceramic rhythm", "fiesta", "Playful ceramic-inspired shapes bring warm plaza energy."],
  cpv: ["Morna Waves", "music across islands", "music", "Flowing staff-like lines carry an easy island musical rhythm."],
  ksa: ["Desert Geometry", "oasis pathways", "geometry", "Precise pathways and palm-like fans meet a cool oasis green."],
  uru: ["Celeste Sun", "sky over the coast", "sky", "Open blue bands and a friendly golden sun feel breezy and bright."],
  fra: ["Atelier Ribbon", "color in motion", "ribbon", "Painterly ribbons sweep across a clean, gallery-like field."],
  sen: ["Baobab Rhythm", "sunset gathering", "baobab", "Branching silhouettes and drum-like circles celebrate togetherness."],
  irq: ["Twin Rivers", "reeds and flowing lines", "reeds", "Two bright currents weave through rhythmic reed geometry."],
  nor: ["Fjord Light", "peaks and reflection", "fjord", "Sharp peaks mirror across cool water under a rosy northern sky."],
  arg: ["Pampas Sky", "wide-open light", "pampas", "Soft sky bands and golden grass lines stretch toward the horizon."],
  aut: ["Alpine Waltz", "peaks in three-four time", "waltz", "Mountain folds repeat in a gentle, dance-like cadence."],
  alg: ["Sahara Courtyard", "arches at sunset", "casbah", "Layered arches frame a warm desert sunset with quiet depth."],
  jor: ["Sandstone Path", "canyon adventure", "sandstone", "Friendly carved-paper canyons lead toward a glowing horizon."],
  por: ["Tile Voyage", "ocean-blue geometry", "voyage", "Original blue tile forms roll like waves on a bright voyage."],
  cod: ["Rainforest Current", "river through green", "rainforest", "Broad leaves and a bright river create a lively forest journey."],
  uzb: ["Silk Road Mosaic", "stars along the way", "silk", "Jewel-toned stars and pathways form an original traveling mosaic."],
  col: ["Golden Bloom", "mountain flower energy", "bloom", "Bright blooms climb layered green hills under a golden sky."],
  eng: ["Garden Stripe", "summer lawn color", "garden", "Clean ribbons and tiny garden blooms feel fresh and playful."],
  cro: ["Adriatic Stone", "sunlit coast geometry", "stone", "Terracotta roofs and blue-water blocks build a seaside rhythm."],
  gha: ["Golden Loom", "woven celebration", "loom", "Original woven geometry pulses with warm gold and green."],
  pan: ["Canal Carnival", "two oceans, one party", "canal", "Curving waterways and confetti-like shapes meet in the middle."],
};

const THEME_SYMBOLS = {
  mex: { animal: "Jaguar", myth: "Feathered serpent", fruit: "Prickly pear" },
  rsa: { animal: "Springbok", myth: "Rain queen", fruit: "Marula" },
  kor: { animal: "Tiger", myth: "Haetae", fruit: "Persimmon" },
  cze: { animal: "Lion", myth: "Golem", fruit: "Plum" },
  can: { animal: "Beaver", myth: "Northern spirit", fruit: "Blueberry" },
  qat: { animal: "Falcon", myth: "Djinn", fruit: "Date" },
  sui: { animal: "Ibex", myth: "Alpine giant", fruit: "Apple" },
  bih: { animal: "Bear", myth: "Dragon", fruit: "Plum" },
  bra: { animal: "Jaguar", myth: "Curupira", fruit: "Acai" },
  mar: { animal: "Atlas lion", myth: "Aisha Qandisha", fruit: "Orange" },
  hai: { animal: "Parrot", myth: "Loup-garou", fruit: "Mango" },
  sco: { animal: "Stag", myth: "Kelpie", fruit: "Raspberry" },
  usa: { animal: "Eagle", myth: "Thunderbird", fruit: "Apple" },
  aus: { animal: "Kangaroo", myth: "Bunyip", fruit: "Finger lime" },
  tur: { animal: "Grey wolf", myth: "Shahmaran", fruit: "Fig" },
  par: { animal: "Jaguar", myth: "Pombero", fruit: "Pineapple" },
  ger: { animal: "Eagle", myth: "Lorelei", fruit: "Apple" },
  cur: { animal: "Flamingo", myth: "Sea spirit", fruit: "Tamarind" },
  civ: { animal: "Elephant", myth: "Anansi", fruit: "Cacao" },
  ecu: { animal: "Condor", myth: "Mountain guardian", fruit: "Passion fruit" },
  ned: { animal: "Lion", myth: "Sea maiden", fruit: "Apple" },
  jpn: { animal: "Crane", myth: "Kitsune", fruit: "Persimmon" },
  swe: { animal: "Elk", myth: "Tomte", fruit: "Lingonberry" },
  tun: { animal: "Falcon", myth: "Desert djinn", fruit: "Date" },
  bel: { animal: "Lion", myth: "Lange Wapper", fruit: "Pear" },
  egy: { animal: "Falcon", myth: "Sphinx", fruit: "Date" },
  irn: { animal: "Lion", myth: "Simurgh", fruit: "Pomegranate" },
  nzl: { animal: "Kiwi", myth: "Taniwha", fruit: "Kiwifruit" },
  esp: { animal: "Bull", myth: "Dragon", fruit: "Orange" },
  cpv: { animal: "Sea turtle", myth: "Mermaid", fruit: "Banana" },
  ksa: { animal: "Falcon", myth: "Djinn", fruit: "Date" },
  uru: { animal: "Rhea", myth: "Lobizon", fruit: "Grape" },
  fra: { animal: "Rooster", myth: "Gargoyle", fruit: "Grape" },
  sen: { animal: "Lion", myth: "Kankurang", fruit: "Baobab fruit" },
  irq: { animal: "Lion", myth: "Lamassu", fruit: "Date" },
  nor: { animal: "Elk", myth: "Huldra", fruit: "Cloudberry" },
  arg: { animal: "Puma", myth: "Nahuelito", fruit: "Grape" },
  aut: { animal: "Eagle", myth: "Lindworm", fruit: "Apricot" },
  alg: { animal: "Fennec", myth: "Djinn", fruit: "Fig" },
  jor: { animal: "Oryx", myth: "Djinn", fruit: "Date" },
  por: { animal: "Rooster", myth: "Enchanted moura", fruit: "Grape" },
  cod: { animal: "Okapi", myth: "River spirit", fruit: "Banana" },
  uzb: { animal: "Snow leopard", myth: "Simurgh", fruit: "Melon" },
  col: { animal: "Condor", myth: "El Dorado", fruit: "Passion fruit" },
  eng: { animal: "Lion", myth: "Green man", fruit: "Apple" },
  cro: { animal: "Marten", myth: "Vila", fruit: "Fig" },
  gha: { animal: "Leopard", myth: "Anansi", fruit: "Cacao" },
  pan: { animal: "Harpy eagle", myth: "Cadejo", fruit: "Pineapple" },
};

const PATTERNS = {
  papel: (a, b, c) => `linear-gradient(135deg, transparent 0 42%, ${c} 43% 56%, transparent 57%), repeating-linear-gradient(45deg, ${a} 0 14px, ${b} 14px 28px)`,
  mosaic: (a, b, c) => `conic-gradient(from 45deg at 25% 25%, ${a} 0 25%, ${b} 0 50%, ${c} 0 75%, ${a} 0)`,
  orbit: (a, b, c) => `radial-gradient(circle at 25% 35%, ${b} 0 8%, transparent 9%), radial-gradient(circle at 70% 55%, ${c} 0 13%, transparent 14%), ${a}`,
  crystal: (a, b, c) => `conic-gradient(from 30deg at 50% 50%, ${a}, ${b}, ${c}, ${b}, ${a})`,
  aurora: (a, b, c) => `repeating-radial-gradient(ellipse at 50% 120%, ${a} 0 12px, ${b} 13px 25px, ${c} 26px 32px)`,
  dunes: (a, b, c) => `radial-gradient(ellipse at 15% 115%, ${a} 0 44%, transparent 45%), radial-gradient(ellipse at 85% 110%, ${c} 0 48%, ${b} 49%)`,
  alpine: (a, b, c) => `linear-gradient(145deg, transparent 0 35%, ${a} 36% 58%, transparent 59%), linear-gradient(35deg, ${b} 0 45%, ${c} 46%)`,
  bridge: (a, b, c) => `radial-gradient(circle at 25% 100%, transparent 0 24%, ${b} 25% 32%, transparent 33%), radial-gradient(circle at 75% 100%, transparent 0 24%, ${c} 25% 32%, ${a} 33%)`,
  canopy: (a, b, c) => `radial-gradient(ellipse at 15% 20%, ${a} 0 20%, transparent 21%), radial-gradient(ellipse at 65% 75%, ${c} 0 25%, transparent 26%), ${b}`,
  zellige: (a, b, c) => `conic-gradient(from 45deg, ${a} 0 12.5%, ${b} 0 25%, ${c} 0 37.5%, ${b} 0 50%, ${a} 0 62.5%, ${c} 0 75%, ${b} 0 87.5%, ${a} 0)`,
  sun: (a, b, c) => `repeating-conic-gradient(from 0deg at 50% 55%, ${a} 0 12deg, ${b} 12deg 24deg, ${c} 24deg 36deg)`,
  tartan: (a, b, c) => `repeating-linear-gradient(0deg, transparent 0 10px, ${b} 11px 16px, transparent 17px 28px), repeating-linear-gradient(90deg, ${a} 0 16px, ${c} 17px 22px, ${a} 23px 34px)`,
  stars: (a, b, c) => `radial-gradient(circle, ${b} 0 2px, transparent 3px) 0 0/18px 18px, linear-gradient(120deg, ${a}, ${c})`,
  reef: (a, b, c) => `radial-gradient(circle at 20% 110%, transparent 0 20%, ${b} 21% 25%, transparent 26%), radial-gradient(circle at 70% 100%, ${c} 0 20%, transparent 21%), ${a}`,
  tulip: (a, b, c) => `radial-gradient(ellipse at 25% 35%, ${b} 0 14%, transparent 15%), radial-gradient(ellipse at 75% 65%, ${c} 0 14%, transparent 15%), linear-gradient(90deg, ${a}, ${b})`,
  lace: (a, b, c) => `repeating-conic-gradient(from 0deg at 50% 50%, ${a} 0 8deg, transparent 9deg 22deg), ${b}`,
  bauhaus: (a, b, c) => `radial-gradient(circle at 25% 35%, ${a} 0 18%, transparent 19%), linear-gradient(90deg, transparent 0 45%, ${b} 46% 70%, ${c} 71%)`,
  breeze: (a, b, c) => `repeating-radial-gradient(ellipse at 0 100%, transparent 0 12px, ${b} 13px 18px, transparent 19px 30px), ${a}`,
  lagoon: (a, b, c) => `repeating-linear-gradient(125deg, ${a} 0 12px, ${b} 13px 20px, ${c} 21px 35px)`,
  rays: (a, b, c) => `repeating-conic-gradient(from -15deg at 20% 100%, ${a} 0 10deg, ${b} 11deg 21deg, ${c} 22deg 32deg)`,
  current: (a, b, c) => `radial-gradient(ellipse at 10% 50%, transparent 0 20%, ${b} 21% 25%, transparent 26%), repeating-linear-gradient(105deg, ${a} 0 16px, ${c} 17px 24px)`,
  ripples: (a, b, c) => `repeating-radial-gradient(circle at 20% 50%, ${b} 0 4px, ${a} 5px 13px, ${c} 14px 17px)`,
  meadow: (a, b, c) => `radial-gradient(circle at 20% 30%, ${b} 0 5%, transparent 6%), radial-gradient(circle at 70% 65%, ${c} 0 6%, transparent 7%), ${a}`,
  jasmine: (a, b, c) => `conic-gradient(from 45deg at 25% 25%, ${b} 0 25%, transparent 0 50%, ${c} 0 75%, transparent 0), ${a}`,
  comic: (a, b, c) => `radial-gradient(circle, ${b} 0 2px, transparent 3px) 0 0/11px 11px, linear-gradient(145deg, ${a} 0 49%, ${c} 50%)`,
  papyrus: (a, b, c) => `repeating-linear-gradient(82deg, ${a} 0 5px, ${b} 6px 14px, ${c} 15px 18px)`,
  arch: (a, b, c) => `radial-gradient(ellipse at 50% 100%, transparent 0 28%, ${b} 29% 36%, ${c} 37% 48%, ${a} 49%)`,
  night: (a, b, c) => `radial-gradient(circle, ${b} 0 2px, transparent 3px) 5px 8px/23px 23px, linear-gradient(160deg, ${a}, ${c})`,
  fiesta: (a, b, c) => `conic-gradient(from 15deg at 25% 50%, ${a}, ${b}, ${c}, ${a})`,
  music: (a, b, c) => `repeating-radial-gradient(ellipse at 0 50%, transparent 0 11px, ${b} 12px 16px, transparent 17px 29px), ${a}`,
  geometry: (a, b, c) => `linear-gradient(30deg, transparent 0 40%, ${b} 41% 55%, transparent 56%), repeating-linear-gradient(120deg, ${a} 0 15px, ${c} 16px 25px)`,
  sky: (a, b, c) => `radial-gradient(circle at 75% 25%, ${c} 0 13%, transparent 14%), linear-gradient(0deg, ${a}, ${b})`,
  ribbon: (a, b, c) => `repeating-linear-gradient(160deg, ${a} 0 18px, ${b} 19px 27px, ${c} 28px 38px)`,
  baobab: (a, b, c) => `radial-gradient(circle at 50% 35%, ${b} 0 24%, transparent 25%), linear-gradient(90deg, transparent 0 43%, ${c} 44% 56%, transparent 57%), ${a}`,
  reeds: (a, b, c) => `repeating-linear-gradient(76deg, ${a} 0 8px, ${b} 9px 12px, ${c} 13px 22px)`,
  fjord: (a, b, c) => `linear-gradient(145deg, transparent 0 35%, ${c} 36% 52%, transparent 53%), linear-gradient(35deg, ${a} 0 47%, ${b} 48%)`,
  pampas: (a, b, c) => `repeating-linear-gradient(80deg, transparent 0 13px, ${c} 14px 16px), linear-gradient(0deg, ${a}, ${b})`,
  waltz: (a, b, c) => `conic-gradient(from 210deg at 25% 100%, ${a} 0 35deg, ${b} 36deg 70deg, ${c} 71deg 105deg, transparent 106deg)`,
  casbah: (a, b, c) => `radial-gradient(ellipse at 25% 100%, transparent 0 25%, ${b} 26% 33%, transparent 34%), radial-gradient(ellipse at 75% 100%, transparent 0 25%, ${c} 26% 33%, ${a} 34%)`,
  sandstone: (a, b, c) => `linear-gradient(105deg, ${a} 0 24%, transparent 25% 42%, ${c} 43% 66%, transparent 67%), ${b}`,
  voyage: (a, b, c) => `conic-gradient(from 45deg at 25% 25%, ${a} 0 25%, ${b} 0 50%, ${c} 0 75%, ${b} 0)`,
  rainforest: (a, b, c) => `radial-gradient(ellipse at 10% 20%, ${b} 0 20%, transparent 21%), radial-gradient(ellipse at 80% 75%, ${c} 0 24%, transparent 25%), ${a}`,
  silk: (a, b, c) => `repeating-conic-gradient(from 45deg at 50% 50%, ${a} 0 15deg, ${b} 16deg 30deg, ${c} 31deg 45deg)`,
  bloom: (a, b, c) => `radial-gradient(circle at 20% 30%, ${b} 0 8%, transparent 9%), radial-gradient(circle at 72% 68%, ${c} 0 11%, transparent 12%), linear-gradient(145deg, ${a}, ${b})`,
  garden: (a, b, c) => `radial-gradient(circle at 30% 30%, ${c} 0 5%, transparent 6%), repeating-linear-gradient(125deg, ${a} 0 18px, ${b} 19px 24px)`,
  stone: (a, b, c) => `linear-gradient(45deg, ${a} 25%, transparent 25%) 0 0/22px 22px, linear-gradient(135deg, ${b} 25%, ${c} 25%) 0 0/22px 22px`,
  loom: (a, b, c) => `repeating-linear-gradient(45deg, ${a} 0 10px, ${b} 11px 20px, ${c} 21px 30px)`,
  canal: (a, b, c) => `repeating-radial-gradient(ellipse at 0 50%, transparent 0 13px, ${b} 14px 19px, transparent 20px 31px), linear-gradient(90deg, ${a}, ${c})`,
};

export const DEFAULT_SKIN = {
  id: "default",
  name: "Retro Stadium Neon",
  team: "Live Scoreboard",
  code: "26",
  price: "Included",
  colors: ["#c94616", "#f7e9bd", "#007d9b"],
  description: "The signature parchment-and-neon Live Scoreboard theme.",
  motif: "stadium lights and matchday print",
  culturalNote: "An original Live Scoreboard poster-style design.",
  symbols: { animal: "Match ball", myth: "Neon comet", fruit: "Victory citrus" },
  pattern: "radial-gradient(circle at 50% 38%, rgba(0, 234, 255, 0.32), transparent 34%), linear-gradient(145deg, #f7e9bd, #0c5261 62%, #6ea117)",
};

export const SKINS = [
  DEFAULT_SKIN,
  ...TEAMS.map((team) => {
    const [name, motif, patternKey, culturalNote] = THEME_STORIES[team.id];
    return {
      id: team.id,
      name,
      team: team.name,
      code: team.code,
      price: "$0.99",
      colors: team.colors,
      description: `${team.name}-inspired ${motif}.`,
      motif,
      culturalNote,
      symbols: THEME_SYMBOLS[team.id],
      pattern: PATTERNS[patternKey](...team.colors),
      patternKey,
    };
  }),
];

export function getSkin(skinId) {
  return SKINS.find((skin) => skin.id === skinId) || DEFAULT_SKIN;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return { r: 0, g: 125, b: 155 };

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function chooseAccent(colors, fallback, prefer = "dark") {
  const candidates = colors.filter((color) => {
    const lightness = luminance(color);
    return prefer === "dark" ? lightness < 0.88 : lightness > 0.24;
  });

  return candidates[0] || colors[0] || fallback;
}

function getSkinSystem(skin) {
  const colors = skin.colors?.length ? skin.colors : DEFAULT_SKIN.colors;
  const warm = chooseAccent(colors, "#c94616", "dark");
  const cool = [...colors].reverse().find((color) => color !== warm && luminance(color) < 0.86) || "#007d9b";
  const glow = colors.find((color) => color !== warm && color !== cool) || "#f7e9bd";

  return {
    warm,
    cool,
    glow,
    paper: `color-mix(in srgb, ${glow} 18%, #f7e9bd)`,
    paperDeep: `color-mix(in srgb, ${warm} 14%, #e6cf92)`,
    paperSoft: `color-mix(in srgb, ${glow} 12%, #fff3cf)`,
    paperLine: `color-mix(in srgb, ${warm} 30%, #c7aa6f)`,
    live: `color-mix(in srgb, ${warm} 76%, #c94616)`,
    liveHot: `color-mix(in srgb, ${warm} 56%, #f36b16)`,
    teal: `color-mix(in srgb, ${cool} 68%, #007d9b)`,
    cyan: `color-mix(in srgb, ${cool} 42%, #00eaff)`,
    grass: `color-mix(in srgb, ${glow} 24%, #6ea117)`,
    stadium: `color-mix(in srgb, ${cool} 28%, #062f43)`,
  };
}

export function applySkin(skinId) {
  const skin = getSkin(skinId);
  const system = getSkinSystem(skin);
  const root = document.documentElement;
  root.dataset.skin = skin.id;
  root.dataset.pattern = skin.patternKey || "default";
  root.style.setProperty("--skin-a", skin.colors[0]);
  root.style.setProperty("--skin-b", skin.colors[1]);
  root.style.setProperty("--skin-c", skin.colors[2]);
  root.style.setProperty("--skin-pattern", skin.pattern);
  root.style.setProperty("--paper", system.paper);
  root.style.setProperty("--paper-deep", system.paperDeep);
  root.style.setProperty("--paper-soft", system.paperSoft);
  root.style.setProperty("--paper-line", system.paperLine);
  root.style.setProperty("--orange", system.live);
  root.style.setProperty("--orange-hot", system.liveHot);
  root.style.setProperty("--teal", system.teal);
  root.style.setProperty("--cyan", system.cyan);
  root.style.setProperty("--grass", system.grass);
  root.style.setProperty("--stadium-night", system.stadium);
  root.style.setProperty("--theme-a", system.warm);
  root.style.setProperty("--theme-b", system.glow);
  root.style.setProperty("--theme-c", system.cool);
  return skin;
}
