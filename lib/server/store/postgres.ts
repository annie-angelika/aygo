// Postgres store (AYGO_DATA_SOURCE=postgres), over Neon's serverless HTTP driver
// — a great fit for Fluid Compute (no pooled connection to hold open). Domain
// objects are stored as JSONB: the catalog rarely changes shape, and per-guest
// state maps 1:1 to the frontend types, so JSONB keeps the schema tiny and the
// reads a straight pass-through. The signed session id is the only key for
// guest data, so one guest can never read another's rows.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { eventCode } from "@/lib/events-data";
import { DATABASE_URL } from "@/lib/server/env";
import type {
  AygoEvent,
  TravelerProfile,
  ProfileEdits,
  Preferences,
  Stamp,
  CityInfo,
  CalendarInfo,
  CategoryStat,
  Attendee,
  FeedbackReply,
  AppNotification,
} from "@/types";
import type { EventDraft } from "@/lib/create-event";
import type { FeedbackKind } from "@/types";
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
  CATALOG_EVENTS,
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
  type Creator,
} from "@/lib/server/store/draft-event";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS events (id text PRIMARY KEY, data jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS travelers (username text PRIMARY KEY, data jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS going (session_id text NOT NULL, event_id text NOT NULL, PRIMARY KEY (session_id, event_id))`,
  `CREATE TABLE IF NOT EXISTS applications (session_id text NOT NULL, event_id text NOT NULL, message text, PRIMARY KEY (session_id, event_id))`,
  `CREATE TABLE IF NOT EXISTS stamps (session_id text NOT NULL, event_id text NOT NULL, data jsonb NOT NULL, PRIMARY KEY (session_id, event_id))`,
  `CREATE TABLE IF NOT EXISTS profiles (session_id text PRIMARY KEY, data jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS preferences (session_id text PRIMARY KEY, data jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS created_events (id text PRIMARY KEY, session_id text NOT NULL, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS cities (slug text PRIMARY KEY, data jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS calendars (id text PRIMARY KEY, data jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS category_pages (category text PRIMARY KEY, data jsonb NOT NULL)`,
  // Earn-date for the collection timeline (added after the table shipped).
  `ALTER TABLE stamps ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`,
  `CREATE TABLE IF NOT EXISTS reports (id text PRIMARY KEY, session_id text NOT NULL, event_id text NOT NULL, kind text NOT NULL, message text NOT NULL, status text NOT NULL DEFAULT 'open', created_at timestamptz NOT NULL DEFAULT now())`,
  // Registration timestamps for the host's manage view.
  `ALTER TABLE going ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`,
  `ALTER TABLE applications ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`,
  // Threads under a question/report (host ↔ guest), and the in-app inbox.
  `CREATE TABLE IF NOT EXISTS report_replies (id text PRIMARY KEY, report_id text NOT NULL, author text NOT NULL, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS report_replies_report_idx ON report_replies (report_id)`,
  `CREATE TABLE IF NOT EXISTS notifications (id text PRIMARY KEY, session_id text NOT NULL, kind text NOT NULL, title text NOT NULL, body text NOT NULL, href text NOT NULL, event_id text, read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS notifications_session_idx ON notifications (session_id, created_at DESC)`,
];

export class PostgresStore implements Store {
  private sql: NeonQueryFunction<false, false>;

  constructor() {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL is required when AYGO_DATA_SOURCE=postgres");
    }
    this.sql = neon(DATABASE_URL);
  }

  async init(): Promise<void> {
    for (const stmt of SCHEMA) await this.sql.query(stmt);
  }

  async seed(): Promise<{ events: number; users: number }> {
    await this.init();
    await this.sql.transaction([
      ...anchoredCatalogEvents().map(
        (e) =>
          this.sql`INSERT INTO events (id, data) VALUES (${e.id}, ${JSON.stringify(e)}::jsonb)
                   ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      ),
      // Travelers are real accounts only — clear any previously seeded ones.
      this.sql`DELETE FROM travelers`,
      ...CATALOG_CITIES.map(
        (c) =>
          this.sql`INSERT INTO cities (slug, data) VALUES (${c.slug}, ${JSON.stringify(c)}::jsonb)
                   ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data`,
      ),
      ...CATALOG_CALENDARS.map(
        (c) =>
          this.sql`INSERT INTO calendars (id, data) VALUES (${c.id}, ${JSON.stringify(c)}::jsonb)
                   ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      ),
      ...CATALOG_CATEGORY_PAGES.map(
        (p) =>
          this.sql`INSERT INTO category_pages (category, data) VALUES (${p.category}, ${JSON.stringify(p)}::jsonb)
                   ON CONFLICT (category) DO UPDATE SET data = EXCLUDED.data`,
      ),
    ]);
    return { events: CATALOG_EVENTS.length, users: 0 };
  }

  /** Real RSVPs per event, with the goer's saved profile when there is one. */
  private async goingByEvent(eventId?: string): Promise<Map<string, Attendee[]>> {
    const rows = eventId
      ? await this.sql`SELECT g.event_id, p.data AS profile FROM going g
                       LEFT JOIN profiles p ON p.session_id = g.session_id
                       WHERE g.event_id = ${eventId}`
      : await this.sql`SELECT g.event_id, p.data AS profile FROM going g
                       LEFT JOIN profiles p ON p.session_id = g.session_id`;
    const map = new Map<string, Attendee[]>();
    for (const r of rows) {
      const profile = (r.profile ?? undefined) as Creator | undefined;
      const list = map.get(r.event_id as string) ?? [];
      list.push({ name: profile?.name || "Guest", avatar: profile?.avatar });
      map.set(r.event_id as string, list);
    }
    return map;
  }

  // --- Catalog ---

  async listEvents(): Promise<AygoEvent[]> {
    // Created events lead (newest first), projected into the catalog shape with
    // the creator's saved profile as the host. Attendance is overlaid live from
    // real RSVPs — never from stored numbers.
    const [created, catalog, going] = await Promise.all([
      this.sql`SELECT ce.data AS draft, p.data AS profile
               FROM created_events ce
               LEFT JOIN profiles p ON p.session_id = ce.session_id
               ORDER BY ce.created_at DESC`,
      this.sql`SELECT data FROM events`,
      this.goingByEvent(),
    ]);
    return withLiveAttendance(
      [
        ...created.map((r) =>
          draftToEvent(r.draft as EventDraft, (r.profile ?? undefined) as Creator | undefined, {
            light: true,
          }),
        ),
        ...catalog.map((r) => r.data as AygoEvent),
      ],
      going,
    );
  }

  async getEvent(id: string): Promise<AygoEvent | null> {
    const [rows, going] = await Promise.all([
      this.sql`SELECT data FROM events WHERE id = ${id}`,
      this.goingByEvent(id),
    ]);
    if (rows.length) {
      return withLiveAttendance([rows[0].data as AygoEvent], going)[0];
    }
    const created = await this.sql`SELECT ce.data AS draft, p.data AS profile
                                   FROM created_events ce
                                   LEFT JOIN profiles p ON p.session_id = ce.session_id
                                   WHERE ce.id = ${id}`;
    return created.length
      ? withLiveAttendance(
          [
            draftToEvent(
              created[0].draft as EventDraft,
              (created[0].profile ?? undefined) as Creator | undefined,
            ),
          ],
          going,
        )[0]
      : null;
  }

  async getEventByCode(code: string): Promise<AygoEvent | null> {
    // Codes are a deterministic hash of the id; resolve in JS over the catalog
    // (small, single round-trip) rather than storing a separate column.
    const events = await this.listEvents();
    return events.find((e) => eventCode(e.id) === code) ?? null;
  }

  async getAttendees(eventId: string): Promise<Attendee[]> {
    return (await this.goingByEvent(eventId)).get(eventId) ?? [];
  }

  async getTraveler(username: string): Promise<TravelerProfile | null> {
    const rows =
      await this.sql`SELECT data FROM travelers WHERE username = ${username}`;
    return rows.length ? (rows[0].data as TravelerProfile) : null;
  }

  // --- Discover ---

  async listCities(): Promise<CityInfo[]> {
    const [rows, events] = await Promise.all([
      this.sql`SELECT data FROM cities`,
      this.listEvents(),
    ]);
    // Seed cities always show (a new city in the code shouldn't wait for a
    // reseed); a stored row for the same slug carries admin edits and wins.
    const stored = new Map(
      rows.map((r) => {
        const c = r.data as Omit<CityInfo, "eventCount">;
        return [c.slug, c] as const;
      }),
    );
    const merged = CATALOG_CITIES.map((c) => ({ ...c, ...stored.get(c.slug) }));
    const seeded = new Set(CATALOG_CITIES.map((c) => c.slug));
    for (const [slug, c] of stored) if (!seeded.has(slug)) merged.push(c);
    return citiesWithCounts(merged, events);
  }

  async listCalendars(): Promise<CalendarInfo[]> {
    const rows = await this.sql`SELECT data FROM calendars`;
    return rows.map((r) => r.data as CalendarInfo);
  }

  async listCategoryStats(): Promise<CategoryStat[]> {
    const [rows, events] = await Promise.all([
      this.sql`SELECT data FROM category_pages`,
      this.listEvents(),
    ]);
    return categoriesWithCounts(
      rows.map((r) => r.data as Omit<CategoryStat, "count">),
      events,
    );
  }

  // --- Admin ---

  async adminStats(): Promise<AdminStats> {
    const [totals, recent] = await Promise.all([
      this.sql`SELECT
        (SELECT count(*) FROM events) AS events,
        (SELECT count(*) FROM created_events) AS created_events,
        (SELECT count(*) FROM going) AS going,
        (SELECT count(*) FROM applications) AS applications,
        (SELECT count(*) FROM stamps) AS stamps,
        (SELECT count(DISTINCT session_id) FROM (
          SELECT session_id FROM going
          UNION SELECT session_id FROM applications
          UNION SELECT session_id FROM stamps
          UNION SELECT session_id FROM profiles
          UNION SELECT session_id FROM created_events
        ) s) AS guests,
        (SELECT count(*) FROM travelers) AS travelers,
        (SELECT count(*) FROM reports WHERE status = 'open') AS open_reports`,
      this.sql`SELECT ce.data AS draft, ce.created_at, p.data AS profile
               FROM created_events ce
               LEFT JOIN profiles p ON p.session_id = ce.session_id
               ORDER BY ce.created_at DESC LIMIT 10`,
    ]);
    const t = totals[0];
    return {
      totals: {
        events: Number(t.events) + Number(t.created_events),
        createdEvents: Number(t.created_events),
        going: Number(t.going),
        applications: Number(t.applications),
        stamps: Number(t.stamps),
        guests: Number(t.guests),
        travelers: Number(t.travelers),
        openReports: Number(t.open_reports),
      },
      recentCreated: recent.map((r) => {
        const draft = r.draft as EventDraft;
        return {
          id: draft.id,
          title: draft.title || "Untitled event",
          startsAt: draft.startsAt,
          createdAt: new Date(r.created_at as string).toISOString(),
          creator:
            ((r.profile ?? undefined) as Creator | undefined)?.name || "guest",
        };
      }),
    };
  }

  async upsertEvent(input: AdminEventInput): Promise<AygoEvent> {
    const id = input.id || slugify(input.title);
    // A guest-created event's draft is its single source of truth (lists read
    // it directly), so an admin edit updates the draft in place — and drops any
    // shadow copy an older build wrote to `events`, which made edits look lost.
    const created = await this.sql`SELECT ce.data AS draft, p.data AS profile
                                   FROM created_events ce
                                   LEFT JOIN profiles p ON p.session_id = ce.session_id
                                   WHERE ce.id = ${id}`;
    if (created.length) {
      const draft = applyAdminInput(created[0].draft as EventDraft, input);
      await this.sql.transaction([
        this
          .sql`UPDATE created_events SET data = ${JSON.stringify(draft)}::jsonb WHERE id = ${id}`,
        this.sql`DELETE FROM events WHERE id = ${id}`,
      ]);
      return draftToEvent(
        draft,
        (created[0].profile ?? undefined) as Creator | undefined,
      );
    }
    const existing = await this.getEvent(id);
    const event = adminInputToEvent(input, id, existing);
    await this
      .sql`INSERT INTO events (id, data) VALUES (${id}, ${JSON.stringify(event)}::jsonb)
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
    return event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const [fromCatalog, fromCreated] = await this.sql.transaction([
      this.sql`DELETE FROM events WHERE id = ${id} RETURNING id`,
      this.sql`DELETE FROM created_events WHERE id = ${id} RETURNING id`,
      // Drop every per-guest reference so nothing dangles.
      this.sql`DELETE FROM going WHERE event_id = ${id}`,
      this.sql`DELETE FROM applications WHERE event_id = ${id}`,
      this.sql`DELETE FROM stamps WHERE event_id = ${id}`,
    ]);
    return fromCatalog.length > 0 || fromCreated.length > 0;
  }

  async upsertCalendar(input: AdminCalendarInput): Promise<CalendarInfo> {
    const id = input.id || slugify(input.name);
    const calendar: CalendarInfo = { ...input, id };
    await this
      .sql`INSERT INTO calendars (id, data) VALUES (${id}, ${JSON.stringify(calendar)}::jsonb)
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
    return calendar;
  }

  async deleteCalendar(id: string): Promise<boolean> {
    const rows =
      await this.sql`DELETE FROM calendars WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }

  // --- Per-guest state ---

  async getRegistrations(sid: string): Promise<Registrations> {
    const [going, applied, stamps] = await Promise.all([
      this.sql`SELECT event_id FROM going WHERE session_id = ${sid}`,
      this.sql`SELECT event_id FROM applications WHERE session_id = ${sid}`,
      this.sql`SELECT data, created_at FROM stamps WHERE session_id = ${sid}`,
    ]);
    return {
      going: going.map((r) => r.event_id as string),
      applied: applied.map((r) => r.event_id as string),
      stamps: stamps.map((r) => ({
        ...(r.data as Stamp),
        earnedAt: new Date(r.created_at as string).toISOString(),
      })),
    };
  }

  async setGoing(sid: string, eventId: string, on: boolean): Promise<void> {
    if (on) {
      await this
        .sql`INSERT INTO going (session_id, event_id) VALUES (${sid}, ${eventId})
             ON CONFLICT DO NOTHING`;
    } else {
      await this
        .sql`DELETE FROM going WHERE session_id = ${sid} AND event_id = ${eventId}`;
    }
  }

  async setApplied(
    sid: string,
    eventId: string,
    on: boolean,
    message?: string,
  ): Promise<void> {
    if (on) {
      await this
        .sql`INSERT INTO applications (session_id, event_id, message) VALUES (${sid}, ${eventId}, ${message ?? null})
             ON CONFLICT (session_id, event_id) DO UPDATE SET message = EXCLUDED.message`;
    } else {
      await this
        .sql`DELETE FROM applications WHERE session_id = ${sid} AND event_id = ${eventId}`;
    }
  }

  async addStamp(sid: string, stamp: Stamp): Promise<void> {
    await this.sql.transaction([
      this
        .sql`INSERT INTO stamps (session_id, event_id, data) VALUES (${sid}, ${stamp.eventId}, ${JSON.stringify(stamp)}::jsonb)
             ON CONFLICT (session_id, event_id) DO UPDATE SET data = EXCLUDED.data`,
      this
        .sql`DELETE FROM going WHERE session_id = ${sid} AND event_id = ${stamp.eventId}`,
      this
        .sql`DELETE FROM applications WHERE session_id = ${sid} AND event_id = ${stamp.eventId}`,
    ]);
  }

  async getProfile(sid: string): Promise<Partial<ProfileEdits>> {
    const rows =
      await this.sql`SELECT data FROM profiles WHERE session_id = ${sid}`;
    return rows.length ? (rows[0].data as Partial<ProfileEdits>) : {};
  }

  async saveProfile(sid: string, edits: ProfileEdits): Promise<void> {
    await this
      .sql`INSERT INTO profiles (session_id, data) VALUES (${sid}, ${JSON.stringify(edits)}::jsonb)
           ON CONFLICT (session_id) DO UPDATE SET data = EXCLUDED.data`;
  }

  async getPreferences(sid: string): Promise<Preferences | null> {
    const rows =
      await this.sql`SELECT data FROM preferences WHERE session_id = ${sid}`;
    return rows.length ? (rows[0].data as Preferences) : null;
  }

  async savePreferences(sid: string, prefs: Preferences): Promise<void> {
    await this
      .sql`INSERT INTO preferences (session_id, data) VALUES (${sid}, ${JSON.stringify(prefs)}::jsonb)
           ON CONFLICT (session_id) DO UPDATE SET data = EXCLUDED.data`;
  }

  async createEvent(sid: string, draft: EventDraft): Promise<void> {
    await this
      .sql`INSERT INTO created_events (id, session_id, data) VALUES (${draft.id}, ${sid}, ${JSON.stringify(draft)}::jsonb)
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
  }

  async listMyEvents(sid: string): Promise<EventDraft[]> {
    const rows = await this
      .sql`SELECT data FROM created_events WHERE session_id = ${sid} ORDER BY created_at DESC`;
    return rows.map((r) => r.data as EventDraft);
  }

  // --- Host tools ---

  async getEventOwner(eventId: string): Promise<string | null> {
    const rows = await this
      .sql`SELECT session_id FROM created_events WHERE id = ${eventId}`;
    return rows.length ? (rows[0].session_id as string) : null;
  }

  async manageEvent(eventId: string) {
    const event = await this.getEvent(eventId);
    if (!event) return null;
    const [draftRows, going, requests, stamps, feedback] = await Promise.all([
      this.sql`SELECT data FROM created_events WHERE id = ${eventId}`,
      this.sql`SELECT g.session_id, g.created_at, p.data AS profile FROM going g
               LEFT JOIN profiles p ON p.session_id = g.session_id
               WHERE g.event_id = ${eventId} ORDER BY g.created_at DESC`,
      this.sql`SELECT a.session_id, a.message, a.created_at, p.data AS profile FROM applications a
               LEFT JOIN profiles p ON p.session_id = a.session_id
               WHERE a.event_id = ${eventId} ORDER BY a.created_at DESC`,
      this.sql`SELECT count(*) AS n FROM stamps WHERE event_id = ${eventId}`,
      this.listReports(),
    ]);
    const row = (r: Record<string, unknown>) => {
      const profile = (r.profile ?? undefined) as Creator | undefined;
      return {
        requestId: r.session_id as string,
        name: profile?.name || "Guest",
        avatar: profile?.avatar,
        at: new Date(r.created_at as string).toISOString(),
      };
    };
    return {
      event,
      draft: draftRows.length ? (draftRows[0].data as EventDraft) : null,
      going: going.map(row),
      requests: requests.map((r) => ({
        ...row(r),
        message: (r.message as string | null) ?? undefined,
      })),
      checkedIn: Number(stamps[0].n),
      feedback: feedback.filter((f) => f.eventId === eventId),
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
    await this
      .sql`INSERT INTO reports (id, session_id, event_id, kind, message)
           VALUES (${id}, ${sid}, ${eventId}, ${kind}, ${message})`;
    return id;
  }

  /** Project report rows (+ their replies and event titles) into inbox rows. */
  private async projectReports(
    rows: Record<string, unknown>[],
  ): Promise<EventReport[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id as string);
    const [events, replies] = await Promise.all([
      this.listEvents(),
      this.sql`SELECT id, report_id, author, message, created_at FROM report_replies
               WHERE report_id = ANY(${ids}) ORDER BY created_at ASC`,
    ]);
    const titles = new Map(events.map((e) => [e.id, e.title]));
    const byReport = new Map<string, FeedbackReply[]>();
    for (const r of replies) {
      const list = byReport.get(r.report_id as string) ?? [];
      list.push({
        id: r.id as string,
        author: r.author as FeedbackReply["author"],
        message: r.message as string,
        createdAt: new Date(r.created_at as string).toISOString(),
      });
      byReport.set(r.report_id as string, list);
    }
    return rows.map((r) => ({
      id: r.id as string,
      eventId: r.event_id as string,
      eventTitle: titles.get(r.event_id as string) ?? "(deleted event)",
      kind: r.kind as FeedbackKind,
      message: r.message as string,
      from: ((r.profile ?? undefined) as Creator | undefined)?.name || "Guest",
      createdAt: new Date(r.created_at as string).toISOString(),
      status: r.status as "open" | "resolved",
      replies: byReport.get(r.id as string) ?? [],
    }));
  }

  async listReports(): Promise<EventReport[]> {
    const rows = await this
      .sql`SELECT r.id, r.event_id, r.kind, r.message, r.status, r.created_at, p.data AS profile
           FROM reports r
           LEFT JOIN profiles p ON p.session_id = r.session_id
           ORDER BY r.created_at DESC`;
    return this.projectReports(rows);
  }

  async listMyReports(sid: string): Promise<EventReport[]> {
    const rows = await this
      .sql`SELECT r.id, r.event_id, r.kind, r.message, r.status, r.created_at, p.data AS profile
           FROM reports r
           LEFT JOIN profiles p ON p.session_id = r.session_id
           WHERE r.session_id = ${sid}
           ORDER BY r.created_at DESC`;
    return this.projectReports(rows);
  }

  async getReport(id: string): Promise<ReportRecord | null> {
    const rows = await this
      .sql`SELECT id, session_id, event_id, kind, status FROM reports WHERE id = ${id}`;
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id as string,
      sid: r.session_id as string,
      eventId: r.event_id as string,
      kind: r.kind as FeedbackKind,
      status: r.status as "open" | "resolved",
    };
  }

  async setReportStatus(
    id: string,
    status: "open" | "resolved",
  ): Promise<boolean> {
    const rows = await this
      .sql`UPDATE reports SET status = ${status} WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }

  async addReply(
    reportId: string,
    author: FeedbackReply["author"],
    message: string,
  ): Promise<void> {
    await this
      .sql`INSERT INTO report_replies (id, report_id, author, message)
           VALUES (${randomUUID()}, ${reportId}, ${author}, ${message})`;
  }

  // --- Notifications ---

  async addNotification(sid: string, input: NotificationInput): Promise<void> {
    await this
      .sql`INSERT INTO notifications (id, session_id, kind, title, body, href, event_id)
           VALUES (${randomUUID()}, ${sid}, ${input.kind}, ${input.title}, ${input.body}, ${input.href}, ${input.eventId ?? null})`;
  }

  async listNotifications(sid: string): Promise<AppNotification[]> {
    const rows = await this
      .sql`SELECT id, kind, title, body, href, event_id, read, created_at FROM notifications
           WHERE session_id = ${sid} ORDER BY created_at DESC LIMIT 100`;
    return rows.map((r) => ({
      id: r.id as string,
      kind: r.kind as AppNotification["kind"],
      title: r.title as string,
      body: r.body as string,
      href: r.href as string,
      eventId: (r.event_id as string | null) ?? undefined,
      read: r.read as boolean,
      createdAt: new Date(r.created_at as string).toISOString(),
    }));
  }

  async markNotificationsRead(sid: string, ids?: string[]): Promise<void> {
    if (ids) {
      await this
        .sql`UPDATE notifications SET read = true WHERE session_id = ${sid} AND id = ANY(${ids})`;
    } else {
      await this
        .sql`UPDATE notifications SET read = true WHERE session_id = ${sid} AND read = false`;
    }
  }
}
