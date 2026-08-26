// Username rules, shared by the client (live validation as you type) and the
// server (the boundary — see lib/server/username.ts, which adds the reserved
// list and the content filter). A username is the public handle behind
// /u/<username>: lowercase, 3–24 chars of letters, digits, dots and
// underscores, starting and ending with a letter or digit, no double dots.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;
export const USERNAME_RE = /^[a-z0-9](?:[a-z0-9_.]{1,22}[a-z0-9])?$/;

/** What the user typed, folded to the canonical form ("@Ana.Rojas " → "ana.rojas"). */
export function normalizeUsername(input: string): string {
  return input
    .trim()
    .replace(/^@/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** A user-facing reason the (normalized) username is invalid, or null when it's fine. */
export function usernameProblem(username: string): string | null {
  if (username.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters.`;
  if (username.length > USERNAME_MAX) return `At most ${USERNAME_MAX} characters.`;
  if (username.includes("..")) return "No double dots.";
  if (!USERNAME_RE.test(username))
    return "Letters, numbers, dots and underscores only — start and end with a letter or number.";
  return null;
}

/**
 * A starting point from what we already know (the social login's name, else
 * the email's local part): "Ana María Rojas" → "ana.rojas". Never assumed to
 * be free — the picker checks availability.
 */
export function suggestUsername(name?: string | null, email?: string | null): string {
  const fromName = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(".");
  const base = normalizeUsername(fromName || (email ?? "").split("@")[0] || "")
    .replace(/[^a-z0-9_.]+/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, USERNAME_MAX);
  return base.length >= USERNAME_MIN ? base : "";
}
