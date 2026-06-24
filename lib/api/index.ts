/**
 * The api layer — the one boundary between the app and its backend.
 *
 * Import features from here (`@/lib/api`), not from the individual files, so the
 * call sites read as a single capability surface. See `./README.md` for the full
 * endpoint contract and the local-first model.
 */

export { api, ApiError, USE_MOCK, setAuthToken } from "@/lib/api/client";

export * from "@/lib/api/events";
export * from "@/lib/api/users";
export * from "@/lib/api/registrations";
export * from "@/lib/api/profile";
export * from "@/lib/api/preferences";
