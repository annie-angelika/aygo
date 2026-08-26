// The events catalog (read) + event creation (write). Each function maps to
// the route documented on it. See `lib/api/README.md`.

import { saveDraft, type EventDraft } from "@/lib/create-event";
import type { AygoEvent, FeedbackKind } from "@/types";
import type { EventReport } from "@/lib/server/store/types";
import { api } from "@/lib/api/client";

export type { EventReport };

/** All events in the catalog. → `GET /events` */
export async function fetchEvents(signal?: AbortSignal): Promise<AygoEvent[]> {
  return api.get<AygoEvent[]>("/events", undefined, signal);
}

/** A single event by id. → `GET /events/:id` */
export async function fetchEvent(
  id: string,
  signal?: AbortSignal,
): Promise<AygoEvent> {
  return api.get<AygoEvent>(`/events/${id}`, undefined, signal);
}

/** An event by its short share code (Luma-style /<code>). → `GET /events/by-code/:code` */
export async function fetchEventByCode(
  code: string,
  signal?: AbortSignal,
): Promise<AygoEvent> {
  return api.get<AygoEvent>(`/events/by-code/${code}`, undefined, signal);
}

/**
 * Create (or edit) an event. The server is the source of truth: the draft is
 * mirrored into localStorage only once it has been accepted, so a refused
 * event never lingers as a phantom "Hosting" row. → `POST /events`
 */
export async function createEvent(draft: EventDraft): Promise<void> {
  await api.post("/events", await withThumb(draft));
  saveDraft(draft);
}

/**
 * Lists must never carry full-size base64 photos, so an uploaded cover gets a
 * small companion `thumb` here (browser only — this runs from client hooks).
 * A stock/URL cover needs none; a failed resize just ships without one.
 */
async function withThumb(draft: EventDraft): Promise<EventDraft> {
  const cover = draft.images?.[0] ?? draft.cover;
  if (!cover?.startsWith("data:") || typeof document === "undefined") return draft;
  try {
    const { makeThumb } = await import("@/lib/image");
    return { ...draft, thumb: await makeThumb(cover) };
  } catch {
    return draft;
  }
}

/** The events this account created, newest first. → `GET /me/events` */
export async function fetchMyEvents(signal?: AbortSignal): Promise<EventDraft[]> {
  return api.get<EventDraft[]>("/me/events", undefined, signal);
}

/**
 * Send a question to the host (they get it in their inbox) or report the event
 * (goes to the admins). Either way it opens a thread you can follow from
 * /inbox. → `POST /events/:id/feedback`
 */
export async function sendEventFeedback(
  eventId: string,
  kind: FeedbackKind,
  message: string,
): Promise<{ id: string }> {
  return api.post<{ id: string }>(`/events/${eventId}/feedback`, { kind, message });
}

/** Your own threads (questions + reports) with every reply. → `GET /me/reports` */
export async function fetchMyThreads(signal?: AbortSignal): Promise<EventReport[]> {
  return api.get<EventReport[]>("/me/reports", undefined, signal);
}

/** Follow up in one of your threads. → `POST /me/reports/:id/reply` */
export async function replyToMyThread(threadId: string, message: string): Promise<void> {
  await api.post(`/me/reports/${threadId}/reply`, { message });
}
