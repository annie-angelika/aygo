// In-app notifications. Routes call these after a write so the other side of
// every interaction hears about it: hosts about registrations/requests/questions,
// guests about decisions and replies, reporters about their report's status.
// Delivery is in-app (the bell + /inbox); email/push channels aren't wired yet.

import "server-only";
import { getStore } from "@/lib/server/store";
import { eventCode } from "@/lib/events-data";
import type { NotificationInput } from "@/lib/server/store/types";

/** The display name a session goes by — its saved profile, else "Guest". */
export async function displayName(sid: string): Promise<string> {
  const profile = await getStore().getProfile(sid);
  return profile.name?.trim() || "Guest";
}

/** Notify the host of an event (no-op for catalog events, which have no owner). */
export async function notifyHost(
  eventId: string,
  input: Omit<NotificationInput, "eventId">,
): Promise<void> {
  const owner = await getStore().getEventOwner(eventId);
  if (!owner) return;
  await getStore().addNotification(owner, { ...input, eventId });
}

/** Notify one guest (by session id). */
export async function notifyGuest(
  sid: string,
  eventId: string,
  input: Omit<NotificationInput, "eventId">,
): Promise<void> {
  await getStore().addNotification(sid, { ...input, eventId });
}

/** Public event page path (the short share code). */
export const eventHref = (id: string) => `/${eventCode(id)}`;
export const manageHref = (id: string, tab?: string) =>
  `/manage/${id}${tab ? `?tab=${tab}` : ""}`;
