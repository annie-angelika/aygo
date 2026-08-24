// In-process store (AYGO_DATA_SOURCE=memory). Everything lives in Maps and resets
// on restart — ideal for local dev and tests, zero setup. The catalog is seeded
// from the mock data the moment the module loads.

import { eventCode } from "@/lib/events-data";
import type {
  AygoEvent,
  TravelerProfile,
  ProfileEdits,
  Preferences,
  Stamp,
  FeedbackReply,
  AppNotification,
} from "@/types";
import type { EventDraft } from "@/lib/create-event";
import type {
  CityInfo,
  CalendarInfo,
  CategoryStat,
  Attendee,
  FeedbackKind,
} from "@/types";
import { randomUUID } from "crypto";
import type {
  Store,
  Registrations,
  AdminStats,
  AdminEventInput,
  AdminCalendarInput,
  EventReport,
  ReportRecord,
  NotificationInput,
} from "@/lib/server/store/types";
import {
  CATALOG_USERS,
  CATALOG_CITIES,
  CATALOG_CALENDARS,
  CATALOG_CATEGORY_PAGES,
  anchoredCatalogEvents,
  citiesWithCounts,
  categoriesWithCounts,
  withLiveAttendance,
} from "@/lib/server/store/catalog";
import {
  draftToEvent,
  adminInputToEvent,
  applyAdminInput,
  slugify,
} from "@/lib/server/store/draft-event";

// Per-guest state, keyed by session id. Values carry the ISO timestamp of the
// action so the host's manage view can show registration times.
type GuestState = {
  going: Map<string, string>; // eventId → registered at
  applied: Map<string, { message?: string; at: string }>;
  stamps: Map<string, Stamp>;
  profile: Partial<ProfileEdits>;
  preferences: Preferences | null;
};

function emptyGuest(): GuestState {
  return {
    going: new Map(),
    applied: new Map(),
    stamps: new Map(),
    profile: {},
    preferences: null,
  };
}

export class MemoryStore implements Store {
  private events = new Map<string, AygoEvent>();
  private users = new Map<string, TravelerProfile>();
  private calendars = new Map<string, CalendarInfo>();
  private guests = new Map<string, GuestState>();
  private reports: (Omit<EventReport, "eventTitle" | "from"> & {
    sid: string;
  })[] = [];
  private notifications = new Map<string, AppNotification[]>();
  private createdEvents: { sid: string; draft: EventDraft; createdAt: string }[] =
    [];

  constructor() {
    void this.seed();
  }

  async init(): Promise<void> {
    // Nothing to create — state is just in-memory Maps.
  }

  async seed(): Promise<{ events: number; users: number }> {
    this.events = new Map(anchoredCatalogEvents().map((e) => [e.id, e]));
    this.users = new Map(CATALOG_USERS.map((u) => [u.username, u]));
    this.calendars = new Map(CATALOG_CALENDARS.map((c) => [c.id, c]));
    return { events: this.events.size, users: this.users.size };
  }

  private guest(sid: string): GuestState {
    let g = this.guests.get(sid);
    if (!g) {
      g = emptyGuest();
      this.guests.set(sid, g);
    }
    return g;
  }

  // --- Catalog ---

  /** Guest drafts, projected into the catalog shape (host = creator profile). */
  private created(light: boolean): AygoEvent[] {
    return this.createdEvents.map(({ sid, draft }) =>
      draftToEvent(draft, this.guests.get(sid)?.profile, { light }),
    );
  }

  /** Real RSVPs per event, with the goer's saved profile when there is one. */
  private goingByEvent(): Map<string, Attendee[]> {
    const map = new Map<string, Attendee[]>();
    for (const g of this.guests.values()) {
      for (const eventId of g.going.keys()) {
        const list = map.get(eventId) ?? [];
        list.push({
          name: g.profile.name || "Guest",
          avatar: g.profile.avatar,
        });
        map.set(eventId, list);
      }
    }
    return map;
  }

  async listEvents(): Promise<AygoEvent[]> {
    return withLiveAttendance(
      [...this.created(true), ...this.events.values()],
      this.goingByEvent(),
    );
  }

  async getEvent(id: string): Promise<AygoEvent | null> {
    const event =
      this.events.get(id) ?? this.created(false).find((e) => e.id === id);
    if (!event) return null;
    return withLiveAttendance([event], this.goingByEvent())[0];
  }

  async getEventByCode(code: string): Promise<AygoEvent | null> {
    return (
      (await this.listEvents()).find((e) => eventCode(e.id) === code) ?? null
    );
  }

  async getAttendees(eventId: string): Promise<Attendee[]> {
    return this.goingByEvent().get(eventId) ?? [];
  }

  async getTraveler(username: string): Promise<TravelerProfile | null> {
    return this.users.get(username) ?? null;
  }

  // --- Discover ---

  async listCities(): Promise<CityInfo[]> {
    return citiesWithCounts(CATALOG_CITIES, await this.listEvents());
  }

  async listCalendars(): Promise<CalendarInfo[]> {
    return [...this.calendars.values()];
  }

  async listCategoryStats(): Promise<CategoryStat[]> {
    return categoriesWithCounts(CATALOG_CATEGORY_PAGES, await this.listEvents());
  }

  // --- Admin ---

  async adminStats(): Promise<AdminStats> {
    let going = 0;
    let applications = 0;
    let stamps = 0;
    for (const g of this.guests.values()) {
      going += g.going.size;
      applications += g.applied.size;
      stamps += g.stamps.size;
    }
    return {
      totals: {
        events: this.events.size + this.createdEvents.length,
        createdEvents: this.createdEvents.length,
        going,
        applications,
        stamps,
        guests: this.guests.size,
        travelers: this.users.size,
        openReports: this.reports.filter((r) => r.status === "open").length,
      },
      recentCreated: this.createdEvents.slice(0, 10).map((c) => ({
        id: c.draft.id,
        title: c.draft.title || "Untitled event",
        startsAt: c.draft.startsAt,
        createdAt: c.createdAt,
        creator: this.guests.get(c.sid)?.profile.name || "guest",
      })),
    };
  }

  async upsertEvent(input: AdminEventInput): Promise<AygoEvent> {
    const id = input.id || slugify(input.title);
    // A guest-created event's draft is its single source of truth (lists read
    // it directly), so an admin edit updates the draft in place — never a
    // shadow copy in the catalog map, which made edits look lost.
    const created = this.createdEvents.find((c) => c.draft.id === id);
    if (created) {
      created.draft = applyAdminInput(created.draft, input);
      this.events.delete(id);
      return draftToEvent(created.draft, this.guests.get(created.sid)?.profile);
    }
    const event = adminInputToEvent(input, id, this.events.get(id));
    this.events.set(id, event);
    return event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const existed =
      this.events.delete(id) ||
      this.createdEvents.some((c) => c.draft.id === id);
    this.createdEvents = this.createdEvents.filter((c) => c.draft.id !== id);
    for (const g of this.guests.values()) {
      g.going.delete(id);
      g.applied.delete(id);
      g.stamps.delete(id);
    }
    return existed;
  }

  async upsertCalendar(input: AdminCalendarInput): Promise<CalendarInfo> {
    const id = input.id || slugify(input.name);
    const calendar: CalendarInfo = { ...input, id };
    this.calendars.set(id, calendar);
    return calendar;
  }

  async deleteCalendar(id: string): Promise<boolean> {
    return this.calendars.delete(id);
  }

  // --- Per-guest state ---

  async getRegistrations(sid: string): Promise<Registrations> {
    const g = this.guest(sid);
    return {
      going: [...g.going.keys()],
      applied: [...g.applied.keys()],
      stamps: [...g.stamps.values()],
    };
  }

  async setGoing(sid: string, eventId: string, on: boolean): Promise<void> {
    const g = this.guest(sid);
    if (on) g.going.set(eventId, new Date().toISOString());
    else g.going.delete(eventId);
  }

  async setApplied(
    sid: string,
    eventId: string,
    on: boolean,
    message?: string,
  ): Promise<void> {
    const g = this.guest(sid);
    if (on) g.applied.set(eventId, { message, at: new Date().toISOString() });
    else g.applied.delete(eventId);
  }

  async addStamp(sid: string, stamp: Stamp): Promise<void> {
    const g = this.guest(sid);
    g.stamps.set(stamp.eventId, {
      ...stamp,
      earnedAt: stamp.earnedAt ?? new Date().toISOString(),
    });
    // Attending removes it from the going/applied lists.
    g.going.delete(stamp.eventId);
    g.applied.delete(stamp.eventId);
  }

  async getProfile(sid: string): Promise<Partial<ProfileEdits>> {
    return this.guest(sid).profile;
  }

  async saveProfile(sid: string, edits: ProfileEdits): Promise<void> {
    this.guest(sid).profile = edits;
  }

  async getPreferences(sid: string): Promise<Preferences | null> {
    return this.guest(sid).preferences;
  }

  async savePreferences(sid: string, prefs: Preferences): Promise<void> {
    this.guest(sid).preferences = prefs;
  }

  async createEvent(sid: string, draft: EventDraft): Promise<void> {
    // Re-creating the same id (a retried sync) replaces, not duplicates.
    this.createdEvents = this.createdEvents.filter((c) => c.draft.id !== draft.id);
    this.createdEvents.unshift({
      sid,
      draft,
      createdAt: new Date().toISOString(),
    });
  }

  async listMyEvents(sid: string): Promise<EventDraft[]> {
    return this.createdEvents.filter((c) => c.sid === sid).map((c) => c.draft);
  }

  // --- Host tools ---

  async getEventOwner(eventId: string): Promise<string | null> {
    return this.createdEvents.find((c) => c.draft.id === eventId)?.sid ?? null;
  }

  async manageEvent(eventId: string) {
    const event = await this.getEvent(eventId);
    if (!event) return null;
    const going: { requestId: string; name: string; avatar?: string; at: string }[] = [];
    const requests: {
      requestId: string;
      name: string;
      avatar?: string;
      at: string;
      message?: string;
    }[] = [];
    let checkedIn = 0;
    for (const [sid, g] of this.guests) {
      const identity = {
        requestId: sid,
        name: g.profile.name || "Guest",
        avatar: g.profile.avatar,
      };
      const goingAt = g.going.get(eventId);
      if (goingAt) going.push({ ...identity, at: goingAt });
      const applied = g.applied.get(eventId);
      if (applied)
        requests.push({ ...identity, at: applied.at, message: applied.message });
      if (g.stamps.has(eventId)) checkedIn++;
    }
    going.sort((a, b) => b.at.localeCompare(a.at));
    requests.sort((a, b) => b.at.localeCompare(a.at));
    return {
      event,
      draft:
        this.createdEvents.find((c) => c.draft.id === eventId)?.draft ?? null,
      going,
      requests,
      checkedIn,
      feedback: (await this.listReports()).filter((f) => f.eventId === eventId),
    };
  }

  // --- Feedback (questions + reports) ---

  async addReport(
    sid: string,
    eventId: string,
    kind: FeedbackKind,
    message: string,
  ): Promise<string> {
    const id = randomUUID();
    this.reports.unshift({
      id,
      sid,
      eventId,
      kind,
      message,
      createdAt: new Date().toISOString(),
      status: "open",
      replies: [],
    });
    return id;
  }

  private async projectReports(
    rows: typeof this.reports,
  ): Promise<EventReport[]> {
    const titles = new Map(
      (await this.listEvents()).map((e) => [e.id, e.title]),
    );
    return rows.map(({ sid, ...r }) => ({
      ...r,
      eventTitle: titles.get(r.eventId) ?? "(deleted event)",
      from: this.guests.get(sid)?.profile.name || "Guest",
    }));
  }

  async listReports(): Promise<EventReport[]> {
    return this.projectReports(this.reports);
  }

  async listMyReports(sid: string): Promise<EventReport[]> {
    return this.projectReports(this.reports.filter((r) => r.sid === sid));
  }

  async getReport(id: string): Promise<ReportRecord | null> {
    const r = this.reports.find((r) => r.id === id);
    return r
      ? { id: r.id, sid: r.sid, eventId: r.eventId, kind: r.kind, status: r.status }
      : null;
  }

  async setReportStatus(
    id: string,
    status: "open" | "resolved",
  ): Promise<boolean> {
    const report = this.reports.find((r) => r.id === id);
    if (!report) return false;
    report.status = status;
    return true;
  }

  async addReply(
    reportId: string,
    author: FeedbackReply["author"],
    message: string,
  ): Promise<void> {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return;
    report.replies.push({
      id: randomUUID(),
      author,
      message,
      createdAt: new Date().toISOString(),
    });
  }

  // --- Notifications ---

  async addNotification(sid: string, input: NotificationInput): Promise<void> {
    const list = this.notifications.get(sid) ?? [];
    list.unshift({
      ...input,
      id: randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.notifications.set(sid, list.slice(0, 100));
  }

  async listNotifications(sid: string): Promise<AppNotification[]> {
    return [...(this.notifications.get(sid) ?? [])];
  }

  async markNotificationsRead(sid: string, ids?: string[]): Promise<void> {
    for (const n of this.notifications.get(sid) ?? []) {
      if (!ids || ids.includes(n.id)) n.read = true;
    }
  }
}
