// The in-app inbox: notifications for the signed-in guest (registrations at
// your events, decisions on your requests, replies in your threads).

import type { AppNotification } from "@/types";
import { api, USE_MOCK } from "@/lib/api/client";

export type NotificationsPage = { items: AppNotification[]; unread: number };

const EMPTY: NotificationsPage = { items: [], unread: 0 };

/** Newest first + unread count. → `GET /me/notifications` */
export async function fetchNotifications(
  signal?: AbortSignal,
): Promise<NotificationsPage> {
  if (USE_MOCK) return EMPTY;
  return api.get<NotificationsPage>("/me/notifications", undefined, signal);
}

/** Mark some (or, with no ids, all) notifications read. → `POST /me/notifications/read` */
export async function markNotificationsRead(ids?: string[]): Promise<void> {
  if (USE_MOCK) return;
  await api.post("/me/notifications/read", ids ? { ids } : {});
}
