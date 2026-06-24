// The user's own gamification state: RSVPs, join requests, and collected stamps.
//
// This is LOCAL-FIRST. The reactive localStorage layer (see `use-registrations`)
// is the instant source of truth, so the UI never waits on the network. These
// functions push each change to the backend afterward; in mock mode they no-op.
// `fetchRegistrations` hydrates the local cache from the server on load.

import type { Stamp } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

/** The shape the backend returns for "my registrations". */
export type Registrations = {
  going: string[]; // event ids the user is attending
  applied: string[]; // event ids with a request pending host approval
  stamps: Stamp[]; // collected aygos
};

/**
 * Load the signed-in user's registrations to seed the local cache.
 * Returns `null` in mock mode (no server → keep whatever's in localStorage).
 * → `GET /me/registrations`
 */
export async function fetchRegistrations(
  signal?: AbortSignal,
): Promise<Registrations | null> {
  if (USE_MOCK) return null;
  return api.get<Registrations>("/me/registrations", undefined, signal);
}

/** Confirm attendance (instant-join events). → `POST /me/registrations/:eventId` */
export async function rsvp(eventId: string): Promise<void> {
  if (USE_MOCK) return;
  await api.post(`/me/registrations/${eventId}`);
}

/** Cancel attendance. → `DELETE /me/registrations/:eventId` */
export async function cancelRsvp(eventId: string): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/me/registrations/${eventId}`);
}

/** Request to join a curated event (pending host approval). → `POST /me/applications/:eventId` */
export async function applyToEvent(
  eventId: string,
  message?: string,
): Promise<void> {
  if (USE_MOCK) return;
  await api.post(`/me/applications/${eventId}`, { message });
}

/** Withdraw a pending join request. → `DELETE /me/applications/:eventId` */
export async function withdrawApplication(eventId: string): Promise<void> {
  if (USE_MOCK) return;
  await api.delete(`/me/applications/${eventId}`);
}

/** Collect the aygo for an attended event. → `POST /me/stamps` */
export async function collectStamp(eventId: string): Promise<void> {
  if (USE_MOCK) return;
  await api.post("/me/stamps", { eventId });
}
