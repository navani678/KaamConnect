/**
 * Stop words in English and common Hinglish/Telugu transliterated connector words.
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
  "by", "from", "of", "about", "need", "required", "urgent", "please",
  "help", "work", "job", "worker", "near", "me", "home", "house", "room",
  "rooms", "want", "looking", "kaam", "cheyali", "chahiye", "karna", "hai"
]);

/**
 * Common synonym maps (English, Hindi, Telugu colloquial & transliterated terms).
 */
const SYNONYMS = {
  // Electrical
  "wiring": ["wire", "wires", "line", "fitting", "re-wiring"],
  "wire": ["wiring", "wires"],
  "fan": ["fans", "ceiling fan", "exhaust fan", "regulator"],
  "fans": ["fan", "ceiling fans"],
  "light": ["lights", "tubelight", "bulb", "led", "cove", "chandelier", "spotlight"],
  "lights": ["light", "lighting", "bulbs", "leds"],
  "switch": ["switches", "switchboard", "board", "socket", "plug"],
  "switchboard": ["board", "switch", "switches", "socket", "mcb board"],
  "mcb": ["fuse", "trip", "tripping", "circuit breaker", "db box"],
  "inverter": ["battery", "ups"],
  "geyser": ["water heater", "heater"],

  // Plumbing
  "tap": ["taps", "faucet", "faucets", "nalla"],
  "faucet": ["tap", "taps"],
  "pipe": ["pipes", "piping", "cpvc", "pvc", "pipeline"],
  "leak": ["leakage", "seepage", "dripping", "leaking"],
  "drain": ["drainage", "clog", "blockage", "blocked", "choke"],
  "toilet": ["commode", "flush", "wc", "bathroom", "sanitary"],
  "sink": ["washbasin", "basin", "kitchen sink"],
  "motor": ["pump", "water motor", "submersible"],

  // Carpentry
  "door": ["doors", "door frame", "lock", "hinge", "latches", "choukat"],
  "window": ["windows", "shutters", "glass window"],
  "cupboard": ["almirah", "wardrobe", "cabinet", "closet", "shelf", "shelves"],
  "furniture": ["table", "chair", "bed", "sofa", "dining"],
  "wood": ["wooden", "timber", "plywood", "ply", "laminate"],

  // Painting
  "paint": ["painting", "color", "colour", "whitewash", "distemper", "emulsion"],
  "painting": ["paint", "color", "colour", "whitewash"],
  "putty": ["wall putty", "primer", "sanding", "smooth finish"],
  "waterproofing": ["damp", "seepage", "water proof"],

  // Masonry & Construction
  "plaster": ["plastering", "cement work", "patch work"],
  "brick": ["bricks", "brickwork", "masonry", "wall building"],
  "concrete": ["slab", "pillar", "beam", "foundation"],

  // Flooring & Tiles
  "tiles": ["tile", "flooring", "wall tiles", "floor tiles", "vitrified"],
  "tile": ["tiles", "tiling"],
  "marble": ["granite", "stone", "polishing"],

  // Welding
  "welding": ["weld", "grill", "gate", "iron gate", "iron work", "railing"],
  "grill": ["welding", "safety grill", "balcony grill"],

  // Cleaning
  "cleaning": ["deep cleaning", "clean", "wash", "mopping", "dusting"],
  "deep clean": ["deep cleaning", "full cleaning", "complete wash"]
};

/**
 * Tokenizes text into lowercase normalized words.
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Checks if a specialization string matches any keywords in the job text.
 * Supports exact token match, substring match, and synonym match.
 * @param {string} spec - e.g. "fan installation", "wiring", "MCB"
 * @param {string} jobText - Combined job title + description
 * @param {string[]} jobTokens - Tokenized job text
 * @returns {boolean}
 */
export function matchSpecialization(spec, jobText, jobTokens) {
  if (!spec || typeof spec !== "string") return false;
  const specLower = spec.toLowerCase().trim();
  const lowerJobText = jobText.toLowerCase();

  // 1. Direct substring match (e.g. "fan installation" in "need fan installation in 3 rooms")
  if (lowerJobText.includes(specLower)) {
    return true;
  }

  // 2. Token overlap
  const specTokens = tokenize(specLower);
  for (const token of specTokens) {
    if (jobTokens.includes(token)) {
      return true;
    }

    // 3. Synonym match
    const syns = SYNONYMS[token] || [];
    for (const syn of syns) {
      if (lowerJobText.includes(syn) || jobTokens.includes(syn)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Finds all matched worker specializations given job text.
 * @param {string} jobText
 * @param {string[]} specializations
 * @returns {string[]} Matched specialization strings
 */
export function findMatchedSpecializations(jobText, specializations = []) {
  if (!specializations || !Array.isArray(specializations) || specializations.length === 0) {
    return [];
  }
  const jobTokens = tokenize(jobText);
  return specializations.filter((spec) => matchSpecialization(spec, jobText, jobTokens));
}
