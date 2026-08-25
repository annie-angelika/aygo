// Small HTTP helpers shared by every route handler: typed JSON responses, a
// throwable error with a status code, and a wrapper that turns thrown errors
// into clean JSON responses. Keeps each handler focused on its domain logic.

import "server-only";

/** Throw this from a handler to short-circuit with a specific status + message. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** JSON success response. */
export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

/** 204, for successful writes with no body to return. */
export function noContent(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Wraps a handler so any thrown `HttpError` becomes its status + `{ message }`,
 * and anything else becomes a 500 (logged, not leaked). Use it around every
 * handler body so error handling is uniform and never duplicated.
 */
export function handler<A extends unknown[]>(
  fn: (req: Request, ...args: A) => Promise<Response>,
) {
  return async (req: Request, ...args: A): Promise<Response> => {
    try {
      return await fn(req, ...args);
    } catch (e) {
      if (e instanceof HttpError) {
        return Response.json({ message: e.message }, { status: e.status });
      }
      console.error("Unhandled API error:", e);
      return Response.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}

/** Default body cap for JSON routes (64 KB); image-carrying routes pass more. */
export const DEFAULT_BODY_BYTES = 64 * 1024;

/**
 * Parse a JSON request body, or throw a 400 if it's malformed, and a 413 when
 * it exceeds `maxBytes` — checked on Content-Length first (free) and again on
 * the actual bytes (a lying client), so an oversized body is never parsed.
 */
export async function readJson<T>(req: Request, maxBytes = DEFAULT_BODY_BYTES): Promise<T> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new HttpError(413, "Request body is too large");
  const type = req.headers.get("content-type") ?? "";
  if (type && !type.toLowerCase().includes("application/json"))
    throw new HttpError(415, "Content-Type must be application/json");
  let text: string;
  try {
    text = await req.text();
  } catch {
    throw new HttpError(400, "Unreadable request body");
  }
  if (text.length > maxBytes) throw new HttpError(413, "Request body is too large");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}
