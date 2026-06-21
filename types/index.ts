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
  cover: string;
  // when
  startsAt: string; // ISO — sort key
  dayKey: string; // "2026-06-27" — groups rows under one date header
  dayLabel: string; // "Today", "Tomorrow", "Sat, Jun 27"
  weekday: string; // "Saturday"
  timeLabel: string; // "20:00"
  isPast: boolean;
  // where
  place: string; // "Plaza Murillo"
  city: string; // "La Paz"
  // who
  host: Host;
  attendees: number;
  attendeeAvatars: string[];
  // what
  price: number | null; // null/0 → free (BOB otherwise)
  blurb: string;
};

/** A collected experience — earned by attending an event. */
export type Stamp = {
  eventId: string;
  title: string;
  category: Category;
};

/** A gamification tier, reached at `min` stamps. */
export type Level = {
  index: number;
  name: string;
  min: number;
};

/** A place a traveler visited and rated — the social-tourism feed. */
export type Visit = {
  id: string;
  place: string;
  city: string;
  cover: string;
  category: Category;
  rating: number; // 1–5
  date: string; // "Jun 14, 2026"
};
