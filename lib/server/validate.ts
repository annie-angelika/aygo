// Input validation primitives for route handlers. Every request body goes
// through these before touching the store: unknown shapes are rejected with a
// 400 that names the field, strings are cleaned (control/invisible characters
// stripped, whitespace collapsed, hard length caps) and enums/ids are checked
// against the app's own lists. Deliberately dependency-free and tiny.

import "server-only";
import { HttpError } from "@/lib/server/http";

/**
 * Control characters and invisible/format code points (zero-width spaces and
 * joiners, soft hyphen, BOM, bidi overrides, Hangul fillers…). They have no
 * place in user text and are a classic filter-evasion trick.
 */
export const INVISIBLE =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]/g;

/** Normalize a free-text string: NFC, strip invisibles, tame whitespace. */
export function cleanText(value: string, { multiline = false } = {}): string {
  let s = value.normalize("NFC").replace(INVISIBLE, "");
  s = multiline
    ? s.replace(/\r\n?/g, "\n").replace(/[ \t\f\v]+/g, " ").replace(/\n{3,}/g, "\n\n")
    : s.replace(/\s+/g, " ");
  return s.trim();
}

export function expectObject(body: unknown, what = "body"): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new HttpError(400, `${what} must be a JSON object`);
  return body as Record<string, unknown>;
}

type StrOpts = { min?: number; max: number; multiline?: boolean; pattern?: RegExp };

/** A required string field, cleaned and length-checked. */
export function str(v: unknown, field: string, opts: StrOpts): string {
  if (typeof v !== "string") throw new HttpError(400, `${field} is required`);
  const s = cleanText(v, { multiline: opts.multiline });
  const min = opts.min ?? 1;
  if (s.length < min)
    throw new HttpError(400, min === 1 ? `${field} is required` : `${field} is too short`);
  if (s.length > opts.max) throw new HttpError(400, `${field} is too long (max ${opts.max})`);
  if (opts.pattern && !opts.pattern.test(s))
    throw new HttpError(400, `${field} has an invalid format`);
  return s;
}

/** An optional string: absent/null/empty → undefined, otherwise validated. */
export function optStr(v: unknown, field: string, opts: StrOpts): string | undefined {
  if (v == null || v === "") return undefined;
  return str(v, field, { ...opts, min: opts.min ?? 1 });
}

export function num(
  v: unknown,
  field: string,
  {
    min = -Infinity,
    max = Infinity,
    integer = false,
  }: { min?: number; max?: number; integer?: boolean } = {},
): number {
  if (typeof v !== "number" || !Number.isFinite(v))
    throw new HttpError(400, `${field} must be a number`);
  if (integer && !Number.isInteger(v)) throw new HttpError(400, `${field} must be a whole number`);
  if (v < min || v > max) throw new HttpError(400, `${field} must be between ${min} and ${max}`);
  return v;
}

export function optNum(
  v: unknown,
  field: string,
  opts?: Parameters<typeof num>[2],
): number | undefined {
  if (v == null || v === "") return undefined;
  return num(v, field, opts);
}

export function bool(v: unknown, field: string, fallback?: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (v == null && fallback !== undefined) return fallback;
  throw new HttpError(400, `${field} must be true or false`);
}

export function enumOf<T extends string>(v: unknown, field: string, allowed: readonly T[]): T {
  if (typeof v !== "string" || !allowed.includes(v as T))
    throw new HttpError(400, `${field} must be one of: ${allowed.join(", ")}`);
  return v as T;
}

export function arrayOf<T>(
  v: unknown,
  field: string,
  max: number,
  item: (x: unknown, i: number) => T,
): T[] {
  if (v == null) return [];
  if (!Array.isArray(v)) throw new HttpError(400, `${field} must be a list`);
  if (v.length > max) throw new HttpError(400, `${field} can have at most ${max} items`);
  return v.map(item);
}

/** RFC 4122 v4 — what `crypto.randomUUID()` produces on the client. */
export const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Ids we mint server-side (reports, notifications) — any RFC 4122 UUID. */
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Catalog event / route ids: short, url-safe slugs. */
export const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** Any id that can appear in a path: a UUID or a slug. */
export function pathId(v: string, field = "id"): string {
  if (!(UUID.test(v) || SLUG.test(v))) throw new HttpError(400, `${field} has an invalid format`);
  return v;
}

/** An https URL on one of the allowed hosts; nothing else (no javascript:, data:, http:). */
export function httpsUrl(v: string, field: string, hosts?: readonly string[]): string {
  if (v.length > 2048) throw new HttpError(400, `${field} is too long`);
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    throw new HttpError(400, `${field} must be a valid https URL`);
  }
  if (url.protocol !== "https:" || url.username || url.password)
    throw new HttpError(400, `${field} must be an https URL`);
  if (hosts && !hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)))
    throw new HttpError(400, `${field} must point to an allowed host`);
  return url.toString();
}

/** A social handle: letters, digits, dots, underscores, dashes; no URLs. */
export const HANDLE = /^@?[A-Za-z0-9._-]{1,64}$/;

/**
 * Key for "is this the same text again?" checks (duplicate titles, repeated
 * messages): case/accent/punctuation-insensitive, whitespace collapsed.
 */
export function dedupeKey(text: string): string {
  return cleanText(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
