// Other people, as far as the app knows them: an event's real attendees and
// the public profile behind a username. No invented graph anywhere.

import type { Attendee, PublicProfile } from "@/types";
import { api } from "@/lib/api/client";

/** Who's really going (RSVPs). → `GET /events/:id/attendees` */
export async function fetchAttendees(
  eventId: string,
  signal?: AbortSignal,
): Promise<Attendee[]> {
  return api.get<Attendee[]>(`/events/${eventId}/attendees`, undefined, signal);
}

/** The public profile at /u/<username>. Throws a 404 `ApiError` when nobody holds it. → `GET /users/:username` */
export async function fetchPublicProfile(
  username: string,
  signal?: AbortSignal,
): Promise<PublicProfile> {
  return api.get<PublicProfile>(`/users/${encodeURIComponent(username)}`, undefined, signal);
}
