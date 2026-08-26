// The admin surface (dashboard only — nothing here is called by the app UI).
// Auth is a signed httpOnly cookie minted by exchanging the admin key once;
// see lib/server/admin.ts.

import type {
  AdminStats,
  AdminEventInput,
  AdminCalendarInput,
  EventReport,
} from "@/lib/server/store/types";
import type { AygoEvent, CalendarInfo } from "@/types";
import { api } from "@/lib/api/client";

export type { AdminStats, AdminEventInput, AdminCalendarInput, EventReport };

/** Is this browser an admin right now? → `GET /admin/session` */
export async function fetchAdminSession(): Promise<boolean> {
  const { admin } = await api.get<{ admin: boolean }>("/admin/session");
  return admin;
}

/** Exchange the admin key for the admin cookie. Throws 401 on a bad key. */
export async function adminLogin(key: string): Promise<void> {
  await api.post("/admin/session", { key });
}

export async function adminLogout(): Promise<void> {
  await api.delete("/admin/session");
}

/** Dashboard totals + recent creations. Requires the admin cookie. */
export async function fetchAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  return api.get<AdminStats>("/admin/stats", undefined, signal);
}

/** Re-run the catalog seed (schema + content). Requires the admin cookie. */
export async function adminSeed(): Promise<{
  seeded: { events: number; users: number };
}> {
  return api.post("/admin/seed");
}

// --- Content management (all admin-cookie gated) -----------------------------

/** Create (no `id`) or update a catalog event. → `POST /admin/events` */
export async function adminUpsertEvent(
  input: AdminEventInput,
): Promise<AygoEvent> {
  return api.post<AygoEvent>("/admin/events", input);
}

/** Remove any event — catalog or user-created. → `DELETE /admin/events/:id` */
export async function adminDeleteEvent(id: string): Promise<void> {
  await api.delete(`/admin/events/${id}`);
}

/** Create (no `id`) or update a featured calendar. → `POST /admin/calendars` */
export async function adminUpsertCalendar(
  input: AdminCalendarInput,
): Promise<CalendarInfo> {
  return api.post<CalendarInfo>("/admin/calendars", input);
}

/** Remove a featured calendar. → `DELETE /admin/calendars/:id` */
export async function adminDeleteCalendar(id: string): Promise<void> {
  await api.delete(`/admin/calendars/${id}`);
}

/** The inbox: every question/report users sent. → `GET /admin/reports` */
export async function fetchReports(
  signal?: AbortSignal,
): Promise<EventReport[]> {
  return api.get<EventReport[]>("/admin/reports", undefined, signal);
}

/** Resolve or reopen an inbox item. → `PATCH /admin/reports/:id` */
export async function setReportStatus(
  id: string,
  status: "open" | "resolved",
): Promise<void> {
  await api.patch(`/admin/reports/${id}`, { status });
}
