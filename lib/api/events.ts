import { events } from "@/lib/mock-data";
import type { Event } from "@/types";

export async function fetchEvents(): Promise<Event[]> {
  // TODO(backend): const res = await fetch('/api/events'); return res.json();
  return events;
}
