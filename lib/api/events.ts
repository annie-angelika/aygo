// The events catalog (read) + event creation (write). In mock mode this serves
// the bundled `events-data` and persists drafts locally; with a backend it maps
// to the routes documented in each function. See `lib/api/README.md`.

import { events, findEvent, findEventByCode } from "@/lib/events-data";
import { saveDraft, type EventDraft } from "@/lib/create-event";
import type { AygoEvent, FeedbackKind } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

/** All events in the catalog. → `GET /events` */
export async function fetchEvents(signal?: AbortSignal): Promise<AygoEvent[]> {
  if (USE_MOCK) return events;
  return api.get<AygoEvent[]>("/events", undefined, signal);
}

/** A single event by id. → `GET /events/:id` */
export async function fetchEvent(
  id: string,
  signal?: AbortSignal,
): Promise<AygoEvent | undefined> {
  if (USE_MOCK) return findEvent(id);
  return api.get<AygoEvent>(`/events/${id}`, undefined, signal);
}

/** An event by its short share code (Luma-style /<code>). → `GET /events/by-code/:code` */
export async function fetchEventByCode(
  code: string,
  signal?: AbortSignal,
): Promise<AygoEvent | undefined> {
  if (USE_MOCK) return findEventByCode(code);
  return api.get<AygoEvent>(`/events/by-code/${code}`, undefined, signal);
}

/**
 * Create an event. Local-first: the draft is persisted to localStorage right
 * away (so the create flow has an instant effect offline), then synced to the
 * backend. → `POST /events`
 */
export async function createEvent(draft: EventDraft): Promise<void> {
  saveDraft(draft); // optimistic: show it immediately
  if (USE_MOCK) return;
  await api.post("/events", draft);
}

/**
 * Send a question to the host or report the event — lands in the admin inbox.
 * → `POST /events/:id/feedback`
 */
export async function sendEventFeedback(
  eventId: string,
  kind: FeedbackKind,
  message: string,
): Promise<void> {
  if (USE_MOCK) return;
  await api.post(`/events/${eventId}/feedback`, { kind, message });
}
