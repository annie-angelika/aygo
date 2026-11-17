// The user's own gamification state: RSVPs, join requests, and collected stamps.
//
// The reactive localStorage layer (see `use-registrations`) mirrors the server
// so the UI never waits on the network; these functions push each change to
// the backend and `fetchRegistrations` hydrates the local cache on load.

import type { AygoEvent, Stamp } from "@/types";
import { api } from "@/lib/api/client";

/** The shape the backend returns for "my registrations". */
export type Registrations = {
  going: string[]; // event ids the user is attending
  applied: string[]; // event ids with a request pending host approval
  stamps: Stamp[]; // collected aygos
};

/** Load the signed-in user's registrations to seed the local cache. → `GET /me/registrations` */
export async function fetchRegistrations(
  signal?: AbortSignal,
): Promise<Registrations> {
  return api.get<Registrations>("/me/registrations", undefined, signal);
}

/** Confirm attendance (instant-join events). → `POST /me/registrations/:eventId` */
export async function rsvp(eventId: string): Promise<void> {
  await api.post(`/me/registrations/${eventId}`);
}

/** Cancel attendance. → `DELETE /me/registrations/:eventId` */
export async function cancelRsvp(eventId: string): Promise<void> {
  await api.delete(`/me/registrations/${eventId}`);
}

/** Request to join a curated event (pending host approval). → `POST /me/applications/:eventId` */
export async function applyToEvent(
  eventId: string,
  message?: string,
): Promise<void> {
  await api.post(`/me/applications/${eventId}`, { message });
}

/** Withdraw a pending join request. → `DELETE /me/applications/:eventId` */
export async function withdrawApplication(eventId: string): Promise<void> {
  await api.delete(`/me/applications/${eventId}`);
}

/** Collect the aygo for an attended event. → `POST /me/stamps` */
export async function collectStamp(eventId: string): Promise<void> {
  await api.post("/me/stamps", { eventId });
}

/**
 * The events behind your tickets (going + checked in), private ones included —
 * the public catalog leaves those out. → `GET /me/tickets`
 */
export async function fetchTicketEvents(signal?: AbortSignal): Promise<AygoEvent[]> {
  return api.get<AygoEvent[]>("/me/tickets", undefined, signal);
}
