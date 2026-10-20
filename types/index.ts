// Single source of truth for domain types. Everything that crosses module
// boundaries (data layer, hooks, components) imports from here.
//
// aygo is an events app: you discover an event, say you're going, coordinate
// over WhatsApp, attend, and collect a passport stamp.

export type Category =
  | "Party"
  | "Music"
  | "Culture"
  | "Food"
  | "Outdoors"
  | "Sports";

export type Host = {
  name: string;
  avatar: string;
  /** For the WhatsApp deep link. Missing → generic chooser. */
  phone?: string;
};

export type AygoEvent = {
  id: string;
  title: string;
  category: Category;
  /** The photo, or "" when the host uploaded none — then `theme` is the cover. */
  cover: string;
  /** The create-flow theme; drawn as the cover (ThemeCover) when there is no photo. */
  theme?: string;
  /** Every photo the host added (the cover is the first). Absent → just `cover`. */
  images?: string[];
  /** CSS object-position for the cover ("50% 30%") — the host's chosen focal point. */
  coverPosition?: string;
  // when
  startsAt: string; // ISO — sort key
  /** ISO end. Present when the event spans a range (esp. multiple days). */
  endsAt?: string;
  dayKey: string; // "2026-06-27" — groups rows under one date header
  dayLabel: string; // "Today", "Tomorrow", "Sat, Jun 27"
  weekday: string; // "Saturday"
  timeLabel: string; // "20:00"
  isPast: boolean;
  // where
  place: string; // "Plaza Murillo"
  city: string; // "La Paz"
  /** Real coordinates for the map + directions. Missing → not mappable yet. */
  lat?: number;
  lng?: number;
  // who
  host: Host;
  attendees: number;
  attendeeAvatars: string[];
  // what
  price: number | null; // null/0 → free (BOB otherwise)
  /** Where guests pay a paid event (aygo doesn't process payments yet). */
  payment?: { whatsapp?: string; link?: string };
  blurb: string;
  /** Host reviews each join request before granting a spot. Absent → instant. */
  requiresApproval?: boolean;
  /** Only set on admin listings: private events are link-only and hidden from Discover. */
  visibility?: "public" | "private";
  /** Max guests; registration closes at this many `attendees`. Absent/null → unlimited. */
  capacity?: number | null;
};

/** The identity fields you can change from "Edit profile" (stored locally). */
export type ProfileEdits = {
  name: string;
  bio: string;
  location: string;
  avatar: string;
  socials: Socials;
  /**
   * Your public handle (/u/<username>). Required for every account — picked
   * right after the first sign-in — and set through its own endpoint (it must
   * be unique), so `PUT /me/profile` ignores it.
   */
  username?: string;
};

/** What anyone can see at /u/<username>: identity + collection + public events. */
export type PublicProfile = {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  socials: Socials;
  stamps: Stamp[];
  /** Public events this person hosts (upcoming first). */
  hosting: AygoEvent[];
};

/** Optional social handles shown as icon links on a profile (Luma-style). */
export type Socials = {
  instagram?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  website?: string;
};

/**
 * Saved app preferences (Settings → Interests). Only what the app actually
 * reads: nothing is stored that no feature consumes.
 */
export type Preferences = {
  /** Interests you picked. Absent → not chosen yet. */
  interests?: Category[];
  /** Home city (a CityInfo name) — Discover's "Explore" shortcuts point here. */
  homeCity?: string;
};

/** A collected experience — earned by attending an event. */
export type Stamp = {
  eventId: string;
  title: string;
  category: Category;
  /** Artwork for the aygo (from the backend). Falls back to the category mark. */
  image?: string;
  /** Tiny base64 preview for a blur-up while the image loads, if the backend has one. */
  blurDataURL?: string;
  /** City of the event, for the stamp's landmark mark. */
  city?: string;
  /** ISO timestamp of when it was collected. */
  earnedAt?: string;
};

// --- Discover (serializable halves — icons/Tailwind classes stay client-side) ---

export type Region = "South America" | "North America" | "Europe";

/** A city on the explorer / its page. `eventCount` is computed by the backend. */
export type CityInfo = {
  slug: string;
  name: string;
  country: string;
  /** ISO 3166-1 alpha-2, lowercase ("bo") — bounds the place search. */
  countryCode?: string;
  region: Region;
  eventCount: number;
  subscribed?: boolean;
  tagline?: string;
  /** City centre, for map defaults and search proximity. */
  lat?: number;
  lng?: number;
  /** [west, south, east, north] — the place search is bounded to this box. */
  bbox?: [number, number, number, number];
  /** Other names the same city goes by ("Santa Cruz de la Sierra"). */
  aliases?: string[];
};

/** A featured community calendar. `category` scopes its events board. */
export type CalendarInfo = {
  id: string;
  name: string;
  logo: string;
  cover: string;
  description: string;
  location?: string;
  featured?: string;
  category?: Category;
};

/** Per-interest stats + copy for browse tiles and the category page. */
export type CategoryStat = {
  category: Category;
  /** Real event count, computed by the backend. */
  count: number;
  blurb?: string;
  image: string;
};

/** Someone actually going to an event — a real RSVP, maybe anonymous. */
export type Attendee = {
  name: string;
  avatar?: string;
  /** Their public handle, when they've picked one (links to /u/<username>). */
  username?: string;
};

/** What a user can send about an event: a question to the host, or a report. */
export type FeedbackKind = "question" | "report";

/** One reply inside a question/report thread. `mine` is resolved per reader. */
export type FeedbackReply = {
  id: string;
  /** Who wrote it, from the reader's point of view. */
  author: "host" | "guest";
  message: string;
  createdAt: string;
};

/** What a notification is about — drives its icon and where it links. */
export type NotificationKind =
  | "registration" // someone got a spot at your event
  | "request" // someone asked to join your event
  | "approved" // the host approved your request
  | "rejected" // the host declined your request
  | "removed" // the host took you off the guest list
  | "question" // a guest asked you something
  | "reply" // the other side answered in a thread
  | "report_update"; // your report was resolved / reopened

/** An in-app notification for the signed-in user. */
export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Where tapping it goes (event page, manage, or the inbox). */
  href: string;
  eventId?: string;
  read: boolean;
  createdAt: string;
};

/** A gamification tier, reached at `min` stamps. */
export type Level = {
  index: number;
  name: string;
  min: number;
};

// --- Metrics (admin dashboard + public traction reports) -------------------

/** One week since launch: cumulative totals as of the end of that week, what
 * was new in it, and how many people did anything in it. Every number is
 * counted from the app's own records — nothing is typed in. */
export type MetricWeek = {
  /** 1-based week number since launch. */
  week: number;
  /** First day of the week, YYYY-MM-DD (La Paz time). */
  start: string;
  /** Whether this week is still running (its numbers are partial). */
  current: boolean;
  users: number;
  newUsers: number;
  hosts: number;
  newHosts: number;
  events: number;
  newEvents: number;
  rsvps: number;
  newRsvps: number;
  requests: number;
  newRequests: number;
  checkins: number;
  newCheckins: number;
  /** Distinct people who did something this week: signed up, created an
   * event, took a spot, asked to join, checked in, or wrote to a host. */
  active: number;
  /** Questions + reports sent this week. */
  inbox: number;
  /** Cities with at least one event created by the end of the week. */
  cities: string[];
};

export type MetricsTotals = {
  /** People who finished sign-up (picked a username). */
  users: number;
  /** Verified logins bound to a session (Google / email code). */
  accounts: number;
  /** People who created at least one event. */
  hosts: number;
  events: number;
  upcomingEvents: number;
  pastEvents: number;
  rsvps: number;
  requests: number;
  checkins: number;
  /** Distinct people active in the last 7 days. */
  activeWeek: number;
  cities: string[];
  categories: { category: string; count: number }[];
  openReports: number;
};

export type MetricsReport = {
  /** ISO timestamp the numbers were computed at (every load recomputes). */
  generatedAt: string;
  /** YYYY-MM-DD the product launched — week 1 starts here. */
  launchedAt: string;
  totals: MetricsTotals;
  weeks: MetricWeek[];
};

/** A public, revocable link to the live report (aygo.app/m/<id>). */
export type MetricShare = {
  id: string;
  label: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
};
