// The host's manage surface — only for events YOU created (the server enforces
// ownership via the session cookie). Import from here in manage components
// only; nothing in the public app needs it.

import type {
  ManageData,
  GuestRow,
  RequestRow,
} from "@/lib/server/store/types";
import { api, USE_MOCK } from "@/lib/api/client";

export type { ManageData, GuestRow, RequestRow };

/** Everything the manage screen shows. Throws 403 if you're not the host. */
export async function fetchManageEvent(
  eventId: string,
  signal?: AbortSignal,
): Promise<ManageData | null> {
  if (USE_MOCK) return null;
  return api.get<ManageData>(`/events/${eventId}/manage`, undefined, signal);
}

/** Approve (→ going) or reject a pending join request. */
export async function decideRequest(
  eventId: string,
  requestId: string,
  approve: boolean,
): Promise<void> {
  await api.post(`/events/${eventId}/requests/${requestId}`, { approve });
}

/** Remove a guest from the going list. */
export async function removeGuest(
  eventId: string,
  requestId: string,
): Promise<void> {
  await api.delete(`/events/${eventId}/guests/${requestId}`);
}

/** Permanently delete your event (page, guest list and requests included). */
export async function deleteManagedEvent(eventId: string): Promise<void> {
  await api.delete(`/events/${eventId}`);
}

/** Resolve/reopen a question or report about your event. */
export async function setFeedbackStatus(
  eventId: string,
  reportId: string,
  status: "open" | "resolved",
): Promise<void> {
  await api.patch(`/events/${eventId}/feedback/${reportId}`, { status });
}

/** Answer a question/report in your event's inbox — the guest is notified. */
export async function replyToFeedback(
  eventId: string,
  reportId: string,
  message: string,
): Promise<void> {
  await api.post(`/events/${eventId}/feedback/${reportId}/reply`, { message });
}
