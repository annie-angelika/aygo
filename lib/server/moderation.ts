import "server-only";

/**
 * Content filter for user-submitted text (event titles/descriptions, names,
 * questions, replies…). It answers one question: may this text be published?
 *
 * DEFENSES (each one alone is easy to dodge; together they're not)
 *   1. Invisible characters are removed (zero-width, bidi, soft hyphen, BOM…).
 *   2. Unicode is folded: NFKC (fullwidth, small caps, math alphabets → ASCII),
 *      accents stripped (ñ kept), and Cyrillic/Greek look-alikes mapped to
 *      Latin ("рutа" written with Cyrillic р/а → "puta").
 *   3. Leetspeak inside words (sh1t, @ss) — never inside plain numbers.
 *   4. Separators between letters are dropped ("p.u.t.a", "p-u-t-a", "p u t a").
 *   5. Stretched letters are collapsed both to two and to one ("puuuta").
 *   6. Matching is whole-word/phrase on EVERY variant above, against the
 *      lists in banned-terms.ts (ES/EN profanity, slurs, sexual services,
 *      illegal offerings). Precision first: ambiguous regional words are not
 *      listed, and an ALLOWLIST masks innocent collisions.
 *   7. Spam heuristics per field policy: links/phones where they don't
 *      belong, shortener links, too many links, character floods, markup or
 *      script-like content, mostly-symbol "titles".
 *
 * The result names the field and the reason so the UI can explain the
 * rejection; matched terms are returned for logging, never shown to users.
 */

import { BANNED, ALLOWLIST } from "@/lib/server/banned-terms";
import { INVISIBLE } from "@/lib/server/validate";

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string; matches: string[] };

// --- Normalization ---------------------------------------------------------


// Cyrillic / Greek / other look-alikes that render like Latin letters.
const CONFUSABLES: Record<string, string> = {
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "х": "x",
  "у": "y", "і": "i", "ѕ": "s", "ј": "j", "ԁ": "d", "һ": "h",
  "ԛ": "q", "ԝ": "w", "ԍ": "g", "ѵ": "v", "к": "k", "м": "m",
  "т": "t", "н": "h", "в": "b",
  "ν": "v", "ο": "o", "α": "a", "ε": "e", "ι": "i", "κ": "k",
  "ρ": "p", "τ": "t", "υ": "u", "χ": "x", "ϲ": "c",
  "ł": "l", "ı": "i", "ǀ": "l",
};
const CONFUSABLE_RE = new RegExp(`[${Object.keys(CONFUSABLES).join("")}]`, "g");

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s",
  "€": "e", "¡": "i", "!": "i",
};
const LEET_CHARS = /[013457@$€¡!]/g;
const LEET_TOKEN = /[a-zñ0-9@$€¡!]+/g;

/** Fold text into a lowercase, single-spaced string of [a-z0-9ñ] words. */
export function normalizeForModeration(text: string): string {
  let s = text.replace(INVISIBLE, "");
  s = s.normalize("NFKC").toLowerCase(); // fullwidth, small caps, math letters → ascii
  s = s.replace(CONFUSABLE_RE, (c) => CONFUSABLES[c] ?? c);
  // Strip combining marks except the tilde (U+0303) so ñ survives; recompose.
  s = s.normalize("NFD").replace(/[\u0300-\u0302\u0304-\u036f]/g, "").normalize("NFC");
  // Leet only inside tokens that also carry a letter; "Bs 455" stays a number.
  s = s.replace(LEET_TOKEN, (tok) =>
    /[a-zñ]/.test(tok) ? tok.replace(LEET_CHARS, (c) => LEET[c] ?? c) : tok,
  );
  // Separator punctuation sandwiched between letters: "p.u.t.a" → "puta".
  s = s.replace(/([a-zñ])[.*_'’´`·\-+~^|/\\]+(?=[a-zñ])/g, "$1");
  s = s.replace(/[^a-z0-9ñ]+/g, " ");
  s = s.replace(/([a-zñ])\1{2,}/g, "$1$1"); // "puuuuta" → "puuta"
  return s.trim().replace(/\s+/g, " ");
}

const SPACED = /\b(?:[a-zñ] ){2,}[a-zñ]\b/g;
const DOUBLED = /([a-zñ])\1+/g;

/** Extra forms of the normalized text an evader may have produced. */
function variants(normalized: string): string[] {
  const joined = normalized.replace(SPACED, (run) => run.replace(/ /g, ""));
  return [
    ...new Set([
      normalized,
      joined, // "p u t a madre" → "puta madre"
      normalized.replace(DOUBLED, "$1"), // "puuta" → "puta"
      joined.replace(DOUBLED, "$1"),
    ]),
  ];
}

// --- Matching --------------------------------------------------------------

/** Returns the banned entries found as whole words/phrases in any variant. */
function findMatches(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  for (const v of variants(normalizeForModeration(text))) {
    let padded = ` ${v} `;
    for (const word of ALLOWLIST) padded = padded.split(` ${word} `).join(" - ");
    for (const term of BANNED) if (padded.includes(` ${term} `)) found.add(term);
  }
  return [...found];
}

// --- Spam heuristics -------------------------------------------------------

const URL_RE =
  /(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|xyz|bo|ar|cl|pe|co|me|link|site|online|club|top|shop|info|biz|ru|cn|tk|ml|ga|cf|gq|app)\b(?:\/\S*)?/gi;
const SHORTENERS =
  /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|rb\.gy|shorturl\.at|tiny\.cc|ow\.ly|buff\.ly|rebrand\.ly|linktr\.ee)\b/i;
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/;
const FLOOD_RE = /(.)\1{9,}/; // the same character 10+ times in a row
const MARKUP_RE = /<[a-z!/][^>]*>|javascript:|data:text|vbscript:/i;

export type TextPolicy = {
  /** Allow up to this many links (0 = none). */
  maxLinks: number;
  /** Allow phone numbers. */
  allowPhone: boolean;
  /** Reject when fewer than this share of characters are letters/digits. */
  minAlnumRatio: number;
};

const POLICIES = {
  /** Titles, names, places: short identity strings. No links, no phones. */
  title: { maxLinks: 0, allowPhone: false, minAlnumRatio: 0.5 },
  /** Descriptions, messages: prose. A few links are fine. */
  body: { maxLinks: 3, allowPhone: true, minAlnumRatio: 0.2 },
  /** Private notes to a host. */
  note: { maxLinks: 0, allowPhone: true, minAlnumRatio: 0.2 },
} satisfies Record<string, TextPolicy>;

export type PolicyName = keyof typeof POLICIES;

function spamReason(text: string, policy: TextPolicy): string | null {
  if (MARKUP_RE.test(text)) return "contains markup or script-like content";
  if (FLOOD_RE.test(text)) return "contains repeated characters";
  const links = text.match(URL_RE) ?? [];
  if (links.length > policy.maxLinks)
    return policy.maxLinks ? `has too many links (max ${policy.maxLinks})` : "can't contain links";
  if (links.some((l) => SHORTENERS.test(l))) return "can't use shortened links";
  if (!policy.allowPhone && PHONE_RE.test(text)) return "can't contain phone numbers";
  const alnum = (text.match(/[\p{L}\p{N}]/gu) ?? []).length;
  if (text.length >= 8 && alnum / text.length < policy.minAlnumRatio) return "is mostly symbols";
  return null;
}

// --- Public API ------------------------------------------------------------

/** Check a single string against the word lists only. */
export function moderateText(text: string): ModerationResult {
  const matches = findMatches(text);
  if (matches.length === 0) return { ok: true };
  return { ok: false, reason: "Text contains language that isn't allowed", matches };
}

/**
 * Check several named fields and return the first failure. `policies` picks
 * the spam rules per field (default: `body`). The reason names the field so
 * the UI can point at it.
 */
export function moderateFields(
  fields: Record<string, string | null | undefined>,
  policies: Partial<Record<string, PolicyName>> = {},
): ModerationResult {
  for (const [name, value] of Object.entries(fields)) {
    if (!value) continue;
    const spam = spamReason(value, POLICIES[policies[name] ?? "body"]);
    if (spam) return { ok: false, reason: `${name} ${spam}`, matches: [] };
    const matches = findMatches(value);
    if (matches.length > 0)
      return { ok: false, reason: `${name} contains language that isn't allowed`, matches };
  }
  return { ok: true };
}
