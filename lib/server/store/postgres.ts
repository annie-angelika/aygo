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
  ProfileEdits,
  PublicProfile,
  Preferences,
  Stamp,
  CityInfo,
  CalendarInfo,
  CategoryStat,
  Attendee,
  FeedbackReply,
  AppNotification,
  MetricShare,
  PaymentReceipt,
} from "@/types";
import type { EventDraft } from "@/lib/create-event";
import type { FeedbackKind } from "@/types";
import { randomUUID } from "crypto";
import type {
  Store,
  Registrations,
  AdminStats,
  MetricsSource,
  AdminEventInput,
  AdminCalendarInput,
  EventReport,
  ReportRecord,
  NotificationInput,
} from "@/lib/server/store/types";
import {
  CATALOG_CITIES,
  CATALOG_CALENDARS,
  CATALOG_CATEGORY_PAGES,
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
  // Paid events: when the host confirmed the guest's money by hand.
  `ALTER TABLE going ADD COLUMN IF NOT EXISTS paid_at timestamptz`,
  // Threads under a question/report (host ↔ guest), and the in-app inbox.
  `CREATE TABLE IF NOT EXISTS report_replies (id text PRIMARY KEY, report_id text NOT NULL, author text NOT NULL, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS report_replies_report_idx ON report_replies (report_id)`,
  `CREATE TABLE IF NOT EXISTS notifications (id text PRIMARY KEY, session_id text NOT NULL, kind text NOT NULL, title text NOT NULL, body text NOT NULL, href text NOT NULL, event_id text, read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS notifications_session_idx ON notifications (session_id, created_at DESC)`,
  // A verified login identity ↔ the guest session that holds its data, so an
  // account follows the person across devices (see lib/server/session.ts).
  `CREATE TABLE IF NOT EXISTS accounts (account_key text PRIMARY KEY, session_id text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now())`,
  // Per-session lookups that used to scan: the host's manage view, inboxes.
  `CREATE INDEX IF NOT EXISTS going_event_idx ON going (event_id)`,
  `CREATE INDEX IF NOT EXISTS applications_event_idx ON applications (event_id)`,
  `CREATE INDEX IF NOT EXISTS stamps_event_idx ON stamps (event_id)`,
  `CREATE INDEX IF NOT EXISTS created_events_session_idx ON created_events (session_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS reports_session_idx ON reports (session_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS reports_event_idx ON reports (event_id)`,
  // The travelers table (never written) is gone with the fake social graph.
  `DROP TABLE IF EXISTS travelers`,
  // One account, many identity keys: a Google id and the same person's email
  // both point at one session, so session_id can no longer be unique.
  `ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_session_id_key`,
  `CREATE INDEX IF NOT EXISTS accounts_session_idx ON accounts (session_id)`,
  // Public handles: one per session, unique across the app (/u/<username>).
  `CREATE TABLE IF NOT EXISTS usernames (username text PRIMARY KEY, session_id text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now())`,
  // Traction metrics: public, revocable links to the live report. (Every
  // number in the report is counted from the tables above — nothing is typed
  // in, so the short-lived manual table is gone.)
  `DROP TABLE IF EXISTS metric_weeks`,
  // Verified in-app payments (guest → host, USDC on Stellar). Kept when the
  // event or the registration goes away: it is a record of money that moved.
  `CREATE TABLE IF NOT EXISTS payments (session_id text NOT NULL, event_id text NOT NULL, tx_hash text NOT NULL UNIQUE, amount text NOT NULL, asset text NOT NULL, paid_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (session_id, event_id))`,
  `CREATE TABLE IF NOT EXISTS metric_shares (id text PRIMARY KEY, label text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz, revoked_at timestamptz)`,
];

function receiptOf(r: Record<string, unknown>): PaymentReceipt {
  return {
    txHash: r.tx_hash as string,
    amount: r.amount as string,
    asset: "USDC",
    at: new Date(r.paid_at as string).toISOString(),
  };
}

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

  async seed(): Promise<{ cities: number; calendars: number }> {
    this.bustEvents();
    await this.init();
    await this.sql.transaction([
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
    return { cities: CATALOG_CITIES.length, calendars: CATALOG_CALENDARS.length };
  }

  /** Real RSVPs per event, with the goer's saved profile when there is one. */
  private async goingByEvent(eventId?: string): Promise<Map<string, Attendee[]>> {
    const rows = eventId
      ? await this.sql`SELECT g.event_id, p.data AS profile, u.username FROM going g
                       LEFT JOIN profiles p ON p.session_id = g.session_id
                       LEFT JOIN usernames u ON u.session_id = g.session_id
                       WHERE g.event_id = ${eventId}`
      : await this.sql`SELECT g.event_id, p.data AS profile, u.username FROM going g
                       LEFT JOIN profiles p ON p.session_id = g.session_id
                       LEFT JOIN usernames u ON u.session_id = g.session_id`;
    const map = new Map<string, Attendee[]>();
    for (const r of rows) {
      const profile = (r.profile ?? undefined) as Creator | undefined;
      const list = map.get(r.event_id as string) ?? [];
      list.push({
        name: profile?.name || "Guest",
        avatar: profile?.avatar,
        ...(r.username ? { username: r.username as string } : null),
      });
      map.set(r.event_id as string, list);
    }
    return map;
  }

  // --- Catalog ---

  /**
   * The event list is read by several endpoints at once (events, cities,
   * categories all need it for one Discover load), so one fresh copy is shared
   * for a few seconds and dropped on every write. Concurrent callers await the
   * same in-flight query.
   */
  private eventsMemo: { at: number; value: Promise<AygoEvent[]> } | null = null;
  private static readonly EVENTS_TTL_MS = 5_000;

  private bustEvents(): void {
    this.eventsMemo = null;
  }

  async listEvents(): Promise<AygoEvent[]> {
    const now = Date.now();
    if (this.eventsMemo && now - this.eventsMemo.at < PostgresStore.EVENTS_TTL_MS) {
      return this.eventsMemo.value;
    }
    const value = this.loadEvents().catch((e) => {
      this.bustEvents();
      throw e;
    });
    this.eventsMemo = { at: now, value };
    return value;
  }

  /** Admin: every event, private ones included and flagged. Never memoised. */
  async listAllEvents(): Promise<AygoEvent[]> {
    return this.loadEvents(true);
  }

  private async loadEvents(includePrivate = false): Promise<AygoEvent[]> {
    // Created events lead (newest first), projected into the catalog shape with
    // the creator's saved profile as the host. Attendance is overlaid live from
    // real RSVPs — never from stored numbers.
    //
    // Private (unlisted) events stay out of every list — they're reachable by
    // link only (getEvent / getEventByCode still resolve them).
    // The projection is done IN SQL: a hosted event's draft carries its photos
    // as base64 (a megabyte each), and lists only need the small `thumb`.
    // Stripping `images` and any base64 `cover` before the rows leave Postgres
    // is what keeps this call at a few KB instead of the whole gallery. (An
    // older draft with a base64 cover and no thumb shows the default cover in
    // lists until it is saved again; its page still shows the real photo.)
    const [created, catalog, going] = await Promise.all([
      this.sql`SELECT (ce.data - 'images')
                      || CASE WHEN ce.data->>'cover' LIKE 'data:%'
                              THEN '{"cover": null}'::jsonb ELSE '{}'::jsonb END AS draft,
                      p.data AS profile
               FROM created_events ce
               LEFT JOIN profiles p ON p.session_id = ce.session_id
               WHERE ${includePrivate}::boolean OR coalesce(ce.data->>'visibility', 'public') <> 'private'
               ORDER BY ce.created_at DESC`,
      this.sql`SELECT data FROM events`,
      this.goingByEvent(),
    ]);
    return withLiveAttendance(
      [
        ...created.map((r) => {
          const draft = r.draft as EventDraft;
          const event = draftToEvent(draft, (r.profile ?? undefined) as Creator | undefined, {
            light: true,
          });
          return includePrivate ? { ...event, visibility: draft.visibility ?? "public" } : event;
        }),
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
    // Codes are a deterministic hash of the id; resolve over the ids alone
    // (one tiny round-trip) and then read that single event in full.
    const rows = await this.sql`SELECT id FROM events UNION ALL SELECT id FROM created_events`;
    const match = rows.find((r) => eventCode(r.id as string) === code);
    return match ? this.getEvent(match.id as string) : null;
  }

  async getAttendees(eventId: string): Promise<Attendee[]> {
    return (await this.goingByEvent(eventId)).get(eventId) ?? [];
  }

  // --- Accounts ---

  async getAccountSession(accountKey: string): Promise<string | null> {
    const rows = await this
      .sql`SELECT session_id FROM accounts WHERE account_key = ${accountKey}`;
    return rows.length ? (rows[0].session_id as string) : null;
  }

  async bindAccount(accountKey: string, sid: string): Promise<void> {
    await this
      .sql`INSERT INTO accounts (account_key, session_id) VALUES (${accountKey}, ${sid})
           ON CONFLICT (account_key) DO NOTHING`;
  }

  async rebindAccount(accountKey: string, sid: string): Promise<void> {
    await this
      .sql`INSERT INTO accounts (account_key, session_id) VALUES (${accountKey}, ${sid})
           ON CONFLICT (account_key) DO UPDATE SET session_id = EXCLUDED.session_id`;
  }

  async getSessionAccount(sid: string): Promise<string | null> {
    const rows = await this
      .sql`SELECT account_key FROM accounts WHERE session_id = ${sid}`;
    return rows.length ? (rows[0].account_key as string) : null;
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

  async upsertCity(city: Omit<CityInfo, "eventCount">): Promise<void> {
    await this
      .sql`INSERT INTO cities (slug, data) VALUES (${city.slug}, ${JSON.stringify(city)}::jsonb)
           ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data`;
  }

  async listCalendars(): Promise<CalendarInfo[]> {
    // Same policy as cities: the code's seed always shows (no reseed needed on
    // a fresh database); a stored row for the same id carries edits and wins.
    const rows = await this.sql`SELECT data FROM calendars`;
    const stored = new Map(
      rows.map((r) => {
        const c = r.data as CalendarInfo;
        return [c.id, c] as const;
      }),
    );
    const merged = CATALOG_CALENDARS.map((c) => ({ ...c, ...stored.get(c.id) }));
    const seeded = new Set(CATALOG_CALENDARS.map((c) => c.id));
    for (const [id, c] of stored) if (!seeded.has(id)) merged.push(c);
    return merged;
  }

  async listCategoryStats(): Promise<CategoryStat[]> {
    // Seed-merged like cities/calendars — "Browse by interest" must not
    // disappear on a database that was never (re)seeded.
    const [rows, events] = await Promise.all([
      this.sql`SELECT data FROM category_pages`,
      this.listEvents(),
    ]);
    const stored = new Map(
      rows.map((r) => {
        const p = r.data as Omit<CategoryStat, "count">;
        return [p.category, p] as const;
      }),
    );
    const merged = CATALOG_CATEGORY_PAGES.map((p) => ({ ...p, ...stored.get(p.category) }));
    const seeded = new Set(CATALOG_CATEGORY_PAGES.map((p) => p.category));
    for (const [category, p] of stored) if (!seeded.has(category)) merged.push(p);
    return categoriesWithCounts(merged, events);
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
    this.bustEvents();
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
    this.bustEvents();
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
      this.sql`SELECT g.event_id,
                      (g.paid_at IS NOT NULL OR EXISTS (
                        SELECT 1 FROM payments p
                        WHERE p.session_id = g.session_id AND p.event_id = g.event_id)) AS paid
               FROM going g WHERE g.session_id = ${sid}`,
      this.sql`SELECT event_id FROM applications WHERE session_id = ${sid}`,
      this.sql`SELECT data, created_at FROM stamps WHERE session_id = ${sid}`,
    ]);
    return {
      going: going.map((r) => r.event_id as string),
      paid: going.filter((r) => r.paid).map((r) => r.event_id as string),
      applied: applied.map((r) => r.event_id as string),
      stamps: stamps.map((r) => ({
        ...(r.data as Stamp),
        earnedAt: new Date(r.created_at as string).toISOString(),
      })),
    };
  }

  async setGoing(sid: string, eventId: string, on: boolean): Promise<void> {
    this.bustEvents();
    if (on) {
      await this
        .sql`INSERT INTO going (session_id, event_id) VALUES (${sid}, ${eventId})
             ON CONFLICT DO NOTHING`;
    } else {
      await this
        .sql`DELETE FROM going WHERE session_id = ${sid} AND event_id = ${eventId}`;
    }
  }

  async setPaid(sid: string, eventId: string, on: boolean): Promise<void> {
    await this
      .sql`UPDATE going SET paid_at = ${on ? new Date().toISOString() : null}
           WHERE session_id = ${sid} AND event_id = ${eventId}`;
  }

  async getPayment(sid: string, eventId: string): Promise<PaymentReceipt | null> {
    const rows = await this
      .sql`SELECT tx_hash, amount, paid_at FROM payments WHERE session_id = ${sid} AND event_id = ${eventId}`;
    return rows.length ? receiptOf(rows[0]) : null;
  }

  async recordPayment(sid: string, eventId: string, receipt: PaymentReceipt): Promise<"ok" | "duplicate"> {
    await this
      .sql`INSERT INTO payments (session_id, event_id, tx_hash, amount, asset, paid_at)
           VALUES (${sid}, ${eventId}, ${receipt.txHash}, ${receipt.amount}, ${receipt.asset}, ${receipt.at})
           ON CONFLICT DO NOTHING`;
    // Either ours landed, this guest had already paid, or the hash is spent.
    return (await this.getPayment(sid, eventId)) ? "ok" : "duplicate";
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
    // The earn-date is the moment of the grant (stored in the column, read
    // back as `earnedAt`); an explicit one only comes from a trusted caller.
    const earnedAt = stamp.earnedAt ?? new Date().toISOString();
    await this.sql.transaction([
      this
        .sql`INSERT INTO stamps (session_id, event_id, data, created_at) VALUES (${sid}, ${stamp.eventId}, ${JSON.stringify(stamp)}::jsonb, ${earnedAt}::timestamptz)
             ON CONFLICT (session_id, event_id) DO UPDATE SET data = EXCLUDED.data`,
      this
        .sql`DELETE FROM going WHERE session_id = ${sid} AND event_id = ${stamp.eventId}`,
      this
        .sql`DELETE FROM applications WHERE session_id = ${sid} AND event_id = ${stamp.eventId}`,
    ]);
  }

  async getProfile(sid: string): Promise<Partial<ProfileEdits>> {
    const [rows, names] = await Promise.all([
      this.sql`SELECT data FROM profiles WHERE session_id = ${sid}`,
      this.sql`SELECT username FROM usernames WHERE session_id = ${sid}`,
    ]);
    const profile = rows.length ? (rows[0].data as Partial<ProfileEdits>) : {};
    return names.length ? { ...profile, username: names[0].username as string } : profile;
  }

  async saveProfile(sid: string, edits: ProfileEdits): Promise<void> {
    this.bustEvents();
    // The handle lives in its own table (uniqueness) — never inside the JSON.
    const { username: _ignored, ...rest } = edits;
    void _ignored;
    await this
      .sql`INSERT INTO profiles (session_id, data) VALUES (${sid}, ${JSON.stringify(rest)}::jsonb)
           ON CONFLICT (session_id) DO UPDATE SET data = EXCLUDED.data`;
  }

  async setUsername(sid: string, username: string): Promise<"ok" | "taken"> {
    // One statement, atomic under concurrency: claim the handle for this
    // session (replacing its previous one) unless another session holds it —
    // then the primary key refuses and we report "taken".
    try {
      await this
        .sql`INSERT INTO usernames (username, session_id) VALUES (${username}, ${sid})
             ON CONFLICT (session_id) DO UPDATE SET username = EXCLUDED.username`;
      return "ok";
    } catch (e) {
      if ((e as { code?: string }).code === "23505") return "taken";
      throw e;
    }
  }

  async getPublicProfile(username: string): Promise<PublicProfile | null> {
    const holder = await this
      .sql`SELECT session_id FROM usernames WHERE username = ${username}`;
    if (!holder.length) return null;
    const sid = holder[0].session_id as string;
    const [profile, regs, mine, events] = await Promise.all([
      this.getProfile(sid),
      this.getRegistrations(sid),
      this.sql`SELECT id FROM created_events WHERE session_id = ${sid}`,
      this.listEvents(),
    ]);
    const owned = new Set(mine.map((r) => r.id as string));
    return {
      username,
      name: profile.name || "Guest",
      avatar: profile.avatar ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      socials: profile.socials ?? {},
      stamps: regs.stamps,
      hosting: events.filter((e) => owned.has(e.id)),
    };
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
    this.bustEvents();
    await this
      .sql`INSERT INTO created_events (id, session_id, data) VALUES (${draft.id}, ${sid}, ${JSON.stringify(draft)}::jsonb)
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
  }

  async listMyEvents(sid: string): Promise<EventDraft[]> {
    // Same list projection as `listEvents`: the API strips base64 media from
    // these drafts anyway (`stripDraftMedia`), so never ship it out of Postgres.
    const rows = await this
      .sql`SELECT (data - 'images')
                  || CASE WHEN data->>'cover' LIKE 'data:%'
                          THEN '{"cover": null}'::jsonb ELSE '{}'::jsonb END AS data
           FROM created_events WHERE session_id = ${sid} ORDER BY created_at DESC`;
    return rows.map((r) => r.data as EventDraft);
  }

  async countRecentEvents(sid: string, windowMs: number): Promise<number> {
    const since = new Date(Date.now() - windowMs).toISOString();
    const rows = await this
      .sql`SELECT count(*) AS n FROM created_events WHERE session_id = ${sid} AND created_at >= ${since}::timestamptz`;
    return Number(rows[0].n);
  }

  async countRecentReports(sid: string, windowMs: number): Promise<number> {
    const since = new Date(Date.now() - windowMs).toISOString();
    const rows = await this
      .sql`SELECT count(*) AS n FROM reports WHERE session_id = ${sid} AND created_at >= ${since}::timestamptz`;
    return Number(rows[0].n);
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
      this.sql`SELECT g.session_id, g.created_at, g.paid_at AS confirmed_at, p.data AS profile, u.username,
                      pay.tx_hash, pay.amount, pay.paid_at FROM going g
               LEFT JOIN profiles p ON p.session_id = g.session_id
               LEFT JOIN usernames u ON u.session_id = g.session_id
               LEFT JOIN payments pay ON pay.session_id = g.session_id AND pay.event_id = g.event_id
               WHERE g.event_id = ${eventId} ORDER BY g.created_at DESC`,
      this.sql`SELECT a.session_id, a.message, a.created_at, p.data AS profile, u.username FROM applications a
               LEFT JOIN profiles p ON p.session_id = a.session_id
               LEFT JOIN usernames u ON u.session_id = a.session_id
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
        ...(r.username ? { username: r.username as string } : null),
        at: new Date(r.created_at as string).toISOString(),
        ...(r.tx_hash ? { payment: receiptOf(r) } : null),
        ...(r.confirmed_at ? { paidAt: new Date(r.confirmed_at as string).toISOString() } : null),
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
    // Private (link-only) events count too: a thread about one is still about
    // a live event, never "(deleted event)" — so read every event, not the
    // public list.
    const [events, replies] = await Promise.all([
      this.listAllEvents(),
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
    await this.sql.transaction([
      this
        .sql`INSERT INTO notifications (id, session_id, kind, title, body, href, event_id)
             VALUES (${randomUUID()}, ${sid}, ${input.kind}, ${input.title}, ${input.body}, ${input.href}, ${input.eventId ?? null})`,
      // Keep the inbox bounded per session — nobody needs more than the last 200.
      this.sql`DELETE FROM notifications WHERE session_id = ${sid} AND id IN (
                 SELECT id FROM notifications WHERE session_id = ${sid}
                 ORDER BY created_at DESC OFFSET 200)`,
    ]);
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

  async countUnreadNotifications(sid: string): Promise<number> {
    const rows = await this
      .sql`SELECT count(*) AS n FROM notifications WHERE session_id = ${sid} AND read = false`;
    return Number(rows[0].n);
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

  // --- Metrics ---

  async metricsSource(): Promise<MetricsSource> {
    const iso = (v: unknown) => new Date(v as string).toISOString();
    const dated = (rows: Record<string, unknown>[]) =>
      rows.map((r) => ({ at: iso(r.created_at), sid: r.session_id as string }));
    const [usernames, accounts, events, going, applications, stamps, reports, open] = await Promise.all([
      this.sql`SELECT session_id, created_at FROM usernames`,
      // One row per session: a Google id and the same person's email are one login.
      this.sql`SELECT min(created_at) AS created_at FROM accounts GROUP BY session_id`,
      this.sql`SELECT session_id, created_at, data->>'startsAt' AS starts_at, data->>'city' AS city, data->>'category' AS category FROM created_events`,
      this.sql`SELECT session_id, created_at FROM going`,
      this.sql`SELECT session_id, created_at FROM applications`,
      this.sql`SELECT session_id, created_at FROM stamps`,
      this.sql`SELECT session_id, created_at FROM reports`,
      this.sql`SELECT count(*) AS n FROM reports WHERE status = 'open'`,
    ]);
    return {
      usernames: dated(usernames),
      accountsAt: accounts.map((r) => iso(r.created_at)),
      events: events.map((r) => ({
        sid: r.session_id as string,
        createdAt: iso(r.created_at),
        startsAt: (r.starts_at as string) ?? "",
        city: (r.city as string) || undefined,
        category: (r.category as string) || undefined,
      })),
      going: dated(going),
      applications: dated(applications),
      stamps: dated(stamps),
      reports: dated(reports),
      openReports: Number(open[0]?.n ?? 0),
    };
  }

  private shareRow(r: Record<string, unknown>): MetricShare {
    const iso = (v: unknown) => (v == null ? null : new Date(v as string).toISOString());
    return {
      id: r.id as string,
      label: r.label as string,
      createdAt: iso(r.created_at) as string,
      expiresAt: iso(r.expires_at),
      revokedAt: iso(r.revoked_at),
    };
  }

  async listMetricShares(): Promise<MetricShare[]> {
    const rows = await this.sql`SELECT * FROM metric_shares ORDER BY created_at DESC`;
    return rows.map((r) => this.shareRow(r));
  }

  async createMetricShare(id: string, label: string, expiresAt: string | null): Promise<MetricShare> {
    const rows = await this
      .sql`INSERT INTO metric_shares (id, label, expires_at) VALUES (${id}, ${label}, ${expiresAt}) RETURNING *`;
    return this.shareRow(rows[0]);
  }

  async getMetricShare(id: string): Promise<MetricShare | null> {
    const rows = await this.sql`SELECT * FROM metric_shares WHERE id = ${id}`;
    return rows.length ? this.shareRow(rows[0]) : null;
  }

  async revokeMetricShare(id: string): Promise<boolean> {
    const rows = await this
      .sql`UPDATE metric_shares SET revoked_at = now() WHERE id = ${id} AND revoked_at IS NULL RETURNING id`;
    return rows.length > 0;
  }

}
