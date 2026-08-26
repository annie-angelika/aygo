// The server's side of usernames: the shared rules (lib/username.ts) plus the
// things only the boundary should know — names that would impersonate the app
// or collide with routes, and the content filter.

import "server-only";
import { HttpError } from "@/lib/server/http";
import { moderateFields } from "@/lib/server/moderation";
import { normalizeUsername, usernameProblem } from "@/lib/username";

/** Route names, brand names and words that read as official or as nobody. */
const RESERVED = new Set([
  "aygo", "admin", "administrator", "support", "help", "official", "staff", "team", "mod", "moderator",
  "api", "u", "me", "you", "guest", "host", "null", "undefined", "anonymous", "anon", "root", "system",
  "discover", "home", "inbox", "profile", "settings", "create", "manage", "terms", "privacy", "login",
  "logout", "signin", "signup", "www", "app", "about", "contact", "collection",
]);

/** Normalize and validate a username, or throw a 400 naming the problem. */
export function validateUsername(raw: unknown): string {
  if (typeof raw !== "string") throw new HttpError(400, "username is required");
  const username = normalizeUsername(raw);
  const problem = usernameProblem(username);
  if (problem) throw new HttpError(400, problem);
  if (RESERVED.has(username) || username.startsWith("aygo"))
    throw new HttpError(400, "That username is reserved.");
  const verdict = moderateFields({ username }, { username: "title" });
  if (!verdict.ok) throw new HttpError(400, "That username isn't allowed.");
  return username;
}
