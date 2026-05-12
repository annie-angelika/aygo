import { destinations } from "@/lib/mock-data";
import type { Destination } from "@/types";

/**
 * Destinations API. Swap these implementations with `fetch('/api/...')`
 * calls when the backend is ready; the hooks above this layer don't change.
 */

export async function fetchDestinations(): Promise<Destination[]> {
  // TODO(backend): const res = await fetch('/api/destinations'); return res.json();
  return destinations;
}

export async function fetchDestination(id: string): Promise<Destination | null> {
  // TODO(backend): const res = await fetch(`/api/destinations/${id}`); return res.json();
  return destinations.find((d) => d.id === id) ?? null;
}

export async function fetchDestinationsByIds(ids: string[]): Promise<Destination[]> {
  // TODO(backend): const res = await fetch(`/api/destinations?ids=${ids.join(',')}`);
  return destinations.filter((d) => ids.includes(d.id));
}
