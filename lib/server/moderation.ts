import "server-only";

/**
 * Content filter for user-submitted event text (title, description, location…).
 *
 * WHAT IT DOES
 *   `moderateText` / `moderateFields` normalize the input and look for banned
 *   words or phrases (Spanish — Bolivia/LatAm — and English profanity, slurs,
 *   and a short list of terms for adult-only / illegal offerings that a public
 *   events app must not publish). It returns the list terms that matched so the
 *   caller can log them or explain the rejection.
 *
 * WHY WHOLE-WORD MATCHING
 *   Substring matching is a false-positive machine ("class" ⊃ "ass",
 *   "cumbia" ⊃ "cum", "análisis" ⊃ "anal"). Every entry is therefore matched as
 *   a complete word or phrase surrounded by word boundaries. Precision is
 *   preferred over recall: ambiguous regional words ("concha", "pico", "coger",
 *   "boludo", "coca"…) are deliberately NOT in the list.
 *
 * NORMALIZATION (applied to the text before matching)
 *   lowercase → strip accents (ñ is preserved so "año" never becomes "ano")
 *   → leetspeak (0→o 1→i 3→e 4→a 5→s 7→t @→a $→s) → drop punctuation between
 *   letters ("p.u.t.a" → "puta") → non-word chars become spaces → collapse
 *   3+ repeated letters to 2 ("puuuta" → "puuta").
 *
 * HOW TO EXTEND
 *   Add entries to BANNED in *normalized* form: lowercase, no accents (keep ñ),
 *   no digits/symbols, single spaces between words. Multi-word phrases are fine
 *   and are preferred for words that are innocent on their own
 *   ("venta de cocaina" rather than "cocaina"). Innocent words that would
 *   normalize into a banned term can be added to ALLOWLIST.
 */

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string; matches: string[] };

// Normalized (see header) banned words and phrases. Order does not matter.
const BANNED: readonly string[] = [
  // --- Spanish profanity (Bolivia / LatAm / general) ---
  "puta", "putas", "puto", "putos", "putita", "putito", "putamadre", "puta madre",
  "reputa", "reputisima", "reputisimo", "hijo de puta", "hija de puta", "hijos de puta",
  "hijodeputa", "hijadeputa", "hijueputa", "hijueputas", "jueputa", "la gran puta",
  "hijo de perra", "hija de perra", "hijos de perra", "mierda", "mierdas", "comemierda",
  "come mierda", "carajo", "carajos", "cabron", "cabrona", "cabrones", "culiao", "culiado",
  "culiada", "culiaos", "qliao", "culiar", "culear", "culiando", "culeando", "cagon", "cagona",
  "cojudo", "cojuda", "cojudos", "cojudas", "cojudez", "cojudeces", "pendejo", "pendeja",
  "pendejos", "pendejas", "pendejada", "pendejadas", "verga", "vergas", "careverga",
  "a la verga", "vete a la verga", "andate a la verga", "me vale verga", "valeverga",
  "chupala", "chupame", "chupamela", "chupapija", "chupaverga", "chupapollas", "chupapinga",
  "mamahuevo", "mamaguevo", "mamaguevos", "mamaverga", "mamada", "mamadas", "lameculos",
  "huevon", "huevona", "huevones", "guevon", "guevona", "webon", "webona", "weon", "weona",
  "coño", "coños", "joder", "jodete", "chinga", "chingar", "chingada", "chingado", "chingados",
  "chingate", "chingatumadre", "chinga tu madre", "chingue a su madre", "culo", "culos",
  "culero", "culera", "culeros", "ojete", "pelotudo", "pelotuda", "pelotudos", "pelotudas",
  "pelotudez", "gilipollas", "malparido", "malparida", "malparidos", "carechimba",
  "conchatumadre", "conchetumadre", "conchesumadre", "conchasumadre", "concha de tu madre",
  "concha de su madre", "la concha de tu madre", "la concha de su madre", "chuchatumadre",
  "chucha tu madre", "chucha de tu madre", "pichula", "pichulas", "follar", "follando",
  "follada", "ramera", "rameras",
  // --- Spanish slurs (homophobic / transphobic / ethnic / ableist) ---
  "maricon", "maricones", "maricona", "mariconazo", "mariconada", "trolo", "trolos", "joto",
  "jotos", "fleto", "fletos", "travelo", "marimacho", "marimacha", "tortillera", "bollera",
  "sudaca", "sudacas", "mongolo", "mongola", "mongolico", "mongolica", "mogolico", "mogolica",
  "subnormal",
  // --- English profanity ---
  "fuck", "fucks", "fucked", "fucker", "fuckers", "fucking", "fuckin", "motherfucker",
  "motherfuckers", "motherfucking", "fck", "fcking", "fcker", "shit", "shits", "shitty", "bullshit", "shithead",
  "shithole", "ass", "asshole", "assholes", "arse", "arsehole", "bitch", "bitches", "bastard",
  "bastards", "cunt", "cunts", "dickhead", "dickheads", "cocksucker", "cocksuckers", "pussy",
  "whore", "whores", "slut", "sluts", "twat", "twats", "wanker", "wankers", "jackass",
  "dumbass", "blowjob", "blowjobs", "handjob", "handjobs", "titties", "cumshot",
  // --- English slurs ---
  "nigger", "niggers", "nigga", "niggas", "faggot", "faggots", "fag", "fags", "dyke", "dykes",
  "tranny", "trannies", "shemale", "retard", "retards", "retarded", "spic", "spics", "wetback",
  "wetbacks", "chink", "chinks", "kike", "kikes", "gook", "gooks", "beaner", "beaners",
  "raghead", "towelhead", "paki",
  // --- Adult-only / sexual services (ES + EN) ---
  "porn", "porno", "pornografia", "pornography", "xxx", "orgia", "orgias", "orgy", "orgies",
  "gangbang", "bukkake", "milf", "dildo", "dildos", "onlyfans", "camgirl", "camgirls",
  "sexo en vivo", "sexo explicito", "striptease", "stripper", "strippers", "table dance",
  "escort", "escorts", "escort service", "servicio de escorts", "servicios de escort",
  "servicios sexuales", "servicio sexual", "sexual services", "dama de compañia",
  "damas de compañia", "masaje erotico", "masajes eroticos", "masaje con final feliz",
  "masajes con final feliz", "happy ending massage", "prostitucion", "prostituta",
  "prostitutas", "prostibulo", "prostibulos", "burdel", "burdeles", "lenocinio",
  // --- Illegal offerings: drugs / weapons (phrases only; bare nouns are used innocently) ---
  "venta de cocaina", "vendo cocaina", "vendemos cocaina", "compra de cocaina",
  "venta de droga", "venta de drogas", "vendo droga", "vendo drogas", "venta de marihuana",
  "vendo marihuana", "venta de pasta base", "vendo pasta base", "venta de lsd", "vendo lsd",
  "venta de extasis", "vendo extasis", "venta de mdma", "vendo mdma", "narcomenudeo",
  "cocaine for sale", "selling cocaine", "buy cocaine", "drugs for sale", "selling drugs",
  "buy drugs", "weed for sale", "selling weed", "mdma for sale", "selling mdma", "drug dealer",
  "venta de armas", "vendo armas", "armas sin papeles", "guns for sale", "selling guns",
];

// Innocent words that contain a banned term. Whole-word matching already keeps
// them safe; they are masked anyway so the matcher stays safe if it is ever
// loosened. Add words here, normalized, if a legitimate term starts tripping.
const ALLOWLIST: readonly string[] = [
  "class", "classes", "bass", "glass", "assist", "cumbia", "cumbre", "canal", "analisis",
  "cocktail", "peacock", "shiitake", "title", "titles", "scunthorpe",
];

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s",
};

/** Normalize free text into a lowercase, single-spaced string of [a-z0-9ñ] words. */
export function normalizeForModeration(text: string): string {
  let s = text.toLowerCase().normalize("NFD");
  // Strip combining marks except the tilde (U+0303) so ñ survives; then recompose.
  s = s.replace(/[\u0300-\u0302\u0304-\u036f]/g, "").normalize("NFC");
  // Leetspeak only inside tokens that also carry a letter ("sh1t"), never in
  // plain numbers — "Bs 455" must stay "455", not become "ass".
  s = s.replace(/[a-zñ0-9@$]+/g, (tok) =>
    /[a-zñ]/.test(tok) ? tok.replace(/[013457@$]/g, (c) => LEET[c] ?? c) : tok,
  );
  // Drop separator punctuation sandwiched between letters: "p.u.t.a" → "puta".
  s = s.replace(/([a-zñ])[.*_'’´`·]+(?=[a-zñ])/g, "$1");
  // Everything that is not a word character becomes a boundary.
  s = s.replace(/[^a-z0-9ñ]+/g, " ");
  // "puuuuta" → "puuta" (3+ repeats collapse to 2).
  s = s.replace(/([a-zñ])\1{2,}/g, "$1$1");
  return s.trim().replace(/\s+/g, " ");
}

/** Returns the banned list entries found as whole words/phrases in `text`. */
function findMatches(text: string): string[] {
  if (!text) return [];
  let padded = ` ${normalizeForModeration(text)} `;
  for (const word of ALLOWLIST) {
    padded = padded.split(` ${word} `).join(" - ");
  }
  const matches: string[] = [];
  for (const term of BANNED) {
    if (padded.includes(` ${term} `)) matches.push(term);
  }
  return matches;
}

/** Check a single string. */
export function moderateText(text: string): ModerationResult {
  const matches = findMatches(text);
  if (matches.length === 0) return { ok: true };
  return { ok: false, reason: "Text contains language that isn't allowed", matches };
}

/**
 * Check several named fields (e.g. `{ title, description, location }`) and
 * return the first failure. The reason names the field so the UI can point at it.
 */
export function moderateFields(
  fields: Record<string, string | null | undefined>,
): ModerationResult {
  for (const [name, value] of Object.entries(fields)) {
    if (!value) continue;
    const matches = findMatches(value);
    if (matches.length > 0) {
      return { ok: false, reason: `${name} contains language that isn't allowed`, matches };
    }
  }
  return { ok: true };
}
