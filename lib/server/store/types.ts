// The data-source contract. Every backend (memory, postgres) implements this
// one interface, and route handlers depend only on it — so swapping stores is a
// config change (AYGO_DATA_SOURCE), never a code change. Methods split cleanly
// into the shared catalog (read) and per-guest state (keyed by session id).

import type {
  AygoEvent,
  TravelerProfile,
  ProfileEdits,
  Preferences,
  Stamp,
  CityInfo,
  CalendarInfo,
  CategoryStat,
  Category,
  Attendee,
  FeedbackKind,
  FeedbackReply,
  AppNotification,
} from "@/types";
import type { EventDraft } from "@/lib/create-event";
import type { Registrations } from "@/lib/api/registrations";

export type { Registrations };

/** What the admin form submits to create or update a catalog event. */
export type AdminEventInput = {
  /** Absent → a new event (the server derives an id from the title). */
  id?: string;
  title: string;
  category: Category;
  city: string;
  place: string;
  startsAt: string; // "YYYY-MM-DDTHH:mm"
  price: number | null;
  blurb: string;
  /** Absent → the server geocodes "place, city" (Nominatim) at write time. */
  lat?: number;
  lng?: number;
  /** Absent → a seeded placeholder image. */
  cover?: string;
  hostName?: string;
  hostPhone?: string;
};

/** What the admin form submits to create or update a featured calendar. */
export type AdminCalendarInput = Omit<CalendarInfo, "id"> & { id?: string };

/** A guest row in the host's manage view. `requestId` keys approve/remove
 * actions (it's the guest's opaque session id — unforgeable without the
 * cookie-signing secret, so exposing it to the event's owner is safe). */
export type GuestRow = {
  requestId: string;
  name: string;
  avatar?: string;
  /** ISO timestamp of when they registered/applied. */
  at: string;
};

/** A pending join request: a guest row plus their note to the host. */
export type RequestRow = GuestRow & { message?: string };

/** Everything the host's manage screen needs, in one round trip. */
export type ManageData = {
  event: AygoEvent;
  /** The editable draft (user-created events); null for catalog events. */
  draft: EventDraft | null;
  going: GuestRow[];
  requests: RequestRow[];
  /** Aygos collected at this event — the check-in count. */
  checkedIn: number;
  /** Questions + reports about this event (the host's support inbox). */
  feedback: EventReport[];
};

/** A question/report a user sent about an event — the admin inbox row. */
export type EventReport = {
  id: string;
  eventId: string;
  /** Resolved at read time so the inbox is self-explanatory. */
  eventTitle: string;
  kind: FeedbackKind;
  message: string;
  /** Reporter's saved profile name, or "Guest". */
  from: string;
  createdAt: string;
  status: "open" | "resolved";
  /** The conversation under it — host/admin answers and the guest's follow-ups. */
  replies: FeedbackReply[];
};

/** What a store needs to know about a report to authorize actions on it. */
export type ReportRecord = {
  id: string;
  /** The reporter's session id — only ever used server-side. */
  sid: string;
  eventId: string;
  kind: FeedbackKind;
  status: "open" | "resolved";
};

/** What a route hands the store to create a notification. */
export type NotificationInput = Omit<AppNotification, "id" | "read" | "createdAt">;

/** One row in the admin "recent creations" feed. */
export type CreatedEventSummary = {
  id: string;
  title: string;
  startsAt: string;
  createdAt: string;
  creator: string;
};

/** Everything the admin dashboard shows, in one round trip. */
export type AdminStats = {
  totals: {
    events: number;
    createdEvents: number;
    going: number;
    applications: number;
    stamps: number;
    guests: number;
    travelers: number;
    openReports: number;
  };
  recentCreated: CreatedEventSummary[];
};

export interface Store {
  /** Create tables if missing. No-op for the memory store. */
  init(): Promise<void>;
  /** Load the catalog (events, travelers, discover content) from the seed data. */
  seed(): Promise<{ events: number; users: number }>;

  // --- Catalog (shared, read-only) ---
  listEvents(): Promise<AygoEvent[]>;
  getEvent(id: string): Promise<AygoEvent | null>;
  getEventByCode(code: string): Promise<AygoEvent | null>;
  /** Real RSVPs for an event (goer name + avatar when they saved a profile). */
  getAttendees(eventId: string): Promise<Attendee[]>;
  getTraveler(username: string): Promise<TravelerProfile | null>;

  // --- Discover (shared, read-only; counts computed from real events) ---
  listCities(): Promise<CityInfo[]>;
  listCalendars(): Promise<CalendarInfo[]>;
  listCategoryStats(): Promise<CategoryStat[]>;

  // --- Admin (content management) ---
  adminStats(): Promise<AdminStats>;
  /** Create or update a catalog event; returns the stored event. */
  upsertEvent(input: AdminEventInput): Promise<AygoEvent>;
  /** Remove an event (catalog or user-created) and every reference to it. */
  deleteEvent(id: string): Promise<boolean>;
  upsertCalendar(input: AdminCalendarInput): Promise<CalendarInfo>;
  deleteCalendar(id: string): Promise<boolean>;

  // --- Per-guest state (keyed by session id) ---
  getRegistrations(sid: string): Promise<Registrations>;
  /** Add (`on`) or remove the event from the guest's "going" list. */
  setGoing(sid: string, eventId: string, on: boolean): Promise<void>;
  /** Add (`on`) or remove a pending join request, with an optional note. */
  setApplied(
    sid: string,
    eventId: string,
    on: boolean,
    message?: string,
  ): Promise<void>;
  /** Collect the aygo for an attended event (also clears going/applied). */
  addStamp(sid: string, stamp: Stamp): Promise<void>;

  getProfile(sid: string): Promise<Partial<ProfileEdits>>;
  saveProfile(sid: string, edits: ProfileEdits): Promise<void>;

  getPreferences(sid: string): Promise<Preferences | null>;
  savePreferences(sid: string, prefs: Preferences): Promise<void>;

  createEvent(sid: string, draft: EventDraft): Promise<void>;
  /** The drafts this session created (newest first) — hydrates a new browser. */
  listMyEvents(sid: string): Promise<EventDraft[]>;

  // --- Host tools (the creator managing their own event) ---
  /** Creator's session id for a user-created event; null for catalog events. */
  getEventOwner(eventId: string): Promise<string | null>;
  /** Everything the manage screen shows; null when the event doesn't exist. */
  manageEvent(eventId: string): Promise<ManageData | null>;

  /** File a question/report about an event. Returns the new report's id. */
  addReport(
    sid: string,
    eventId: string,
    kind: FeedbackKind,
    message: string,
  ): Promise<string>;
  /** The admin inbox, newest first. */
  listReports(): Promise<EventReport[]>;
  /** The threads THIS session opened (questions + reports), newest first. */
  listMyReports(sid: string): Promise<EventReport[]>;
  /** Authorization facts about one report; null when it doesn't exist. */
  getReport(id: string): Promise<ReportRecord | null>;
  setReportStatus(id: string, status: "open" | "resolved"): Promise<boolean>;
  /** Append a reply to a thread. `author` is who's speaking, resolved by the route. */
  addReply(
    reportId: string,
    author: FeedbackReply["author"],
    message: string,
  ): Promise<void>;

  // --- Notifications (in-app inbox, per session) ---
  addNotification(sid: string, input: NotificationInput): Promise<void>;
  /** Newest first, capped to a sensible page. */
  listNotifications(sid: string): Promise<AppNotification[]>;
  /** Mark the given ids read — or everything when `ids` is omitted. */
  markNotificationsRead(sid: string, ids?: string[]): Promise<void>;
}
