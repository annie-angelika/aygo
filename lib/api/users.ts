// Travelers (public profiles) + an event's attendees — the social-graph reads.
// No fake graph anywhere: attendees are real RSVPs from the backend, and in
// mock mode (no backend) both lists are honestly empty.

import { findUser } from "@/lib/users-data";
import type { TravelerProfile, Attendee } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

/** A public traveler profile by username. → `GET /users/:username` */
export async function fetchTraveler(
  username: string,
  signal?: AbortSignal,
): Promise<TravelerProfile | undefined> {
  if (USE_MOCK) return findUser(username);
  return api.get<TravelerProfile>(`/users/${username}`, undefined, signal);
}

/** Who's really going (RSVPs). → `GET /events/:id/attendees` */
export async function fetchAttendees(
  eventId: string,
  signal?: AbortSignal,
): Promise<Attendee[]> {
  if (USE_MOCK) return [];
  return api.get<Attendee[]>(`/events/${eventId}/attendees`, undefined, signal);
}
