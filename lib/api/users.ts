// Travelers (public profiles) + an event's attendees — the social-graph reads.
// Mock mode resolves from `users-data`; with a backend, see the routes below.

import { findUser, attendeesFor } from "@/lib/users-data";
import type { TravelerProfile } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

/** A public traveler profile by username. → `GET /users/:username` */
export async function fetchTraveler(
  username: string,
  signal?: AbortSignal,
): Promise<TravelerProfile | undefined> {
  if (USE_MOCK) return findUser(username);
  return api.get<TravelerProfile>(`/users/${username}`, undefined, signal);
}

/** Travelers attending an event (the discovery surface). → `GET /events/:id/attendees` */
export async function fetchAttendees(
  eventId: string,
  signal?: AbortSignal,
): Promise<TravelerProfile[]> {
  if (USE_MOCK) return attendeesFor(eventId);
  return api.get<TravelerProfile[]>(
    `/events/${eventId}/attendees`,
    undefined,
    signal,
  );
}
