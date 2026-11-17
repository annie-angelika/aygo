// GET /api/me/tickets → the events behind this guest's tickets: everything
// they are going to or checked in to, as list rows. Unlike the public catalog
// (GET /events) this includes PRIVATE events — a link-only event you
// registered for is still your ticket, and must show up in /home.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  const sid = await getSessionId();
  const store = getStore();
  const { going, stamps } = await store.getRegistrations(sid);
  const mine = new Set([...going, ...stamps.map((s) => s.eventId)]);
  if (mine.size === 0) return json([]);
  const events = await store.listAllEvents();
  return json(
    events
      .filter((e) => mine.has(e.id))
      // `visibility` is an admin-list detail; ticket rows are plain events.
      .map(({ visibility, ...event }) => (void visibility, event)),
  );
});
