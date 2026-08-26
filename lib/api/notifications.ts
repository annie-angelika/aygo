// The in-app inbox: notifications for the signed-in guest (registrations at
// your events, decisions on your requests, replies in your threads).

import type { AppNotification } from "@/types";
import { api } from "@/lib/api/client";

export type NotificationsPage = { items: AppNotification[]; unread: number };

/** Newest first + unread count. → `GET /me/notifications` */
export async function fetchNotifications(
  signal?: AbortSignal,
): Promise<NotificationsPage> {
  return api.get<NotificationsPage>("/me/notifications", undefined, signal);
}

/** Mark some (or, with no ids, all) notifications read. → `POST /me/notifications/read` */
export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await api.post("/me/notifications/read", ids ? { ids } : {});
}
