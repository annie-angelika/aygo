import { events, findEvent, findEventByCode } from "@/lib/events-data";
import type { AygoEvent } from "@/types";

export async function fetchEvents(): Promise<AygoEvent[]> {
  // TODO(backend): const res = await fetch('/api/events'); return res.json();
  return events;
}

export async function fetchEvent(id: string): Promise<AygoEvent | undefined> {
  // TODO(backend): const res = await fetch(`/api/events/${id}`); return res.json();
  return findEvent(id);
}

export async function fetchEventByCode(
  code: string,
): Promise<AygoEvent | undefined> {
  // TODO(backend): const res = await fetch(`/api/events/by-code/${code}`); return res.json();
  return findEventByCode(code);
}
