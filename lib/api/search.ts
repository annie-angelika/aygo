import { destinations, events, guides } from "@/lib/mock-data";
import type { Destination, Event, Guide } from "@/types";

export type SearchResults = {
  destinations: Destination[];
  events: Event[];
  guides: Guide[];
};

const norm = (s: string) => s.toLowerCase().trim();

export async function searchAll(query: string): Promise<SearchResults> {
  // TODO(backend): const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const q = norm(query);
  if (!q) return { destinations: [], events: [], guides: [] };
  const matches = (h: string) => norm(h).includes(q);

  return {
    destinations: destinations
      .filter(
        (d) =>
          matches(d.name) ||
          matches(d.region) ||
          matches(d.vibe) ||
          matches(d.tagline),
      )
      .slice(0, 4),
    events: events
      .filter((e) => matches(e.name) || matches(e.region) || matches(e.vibe))
      .slice(0, 3),
    guides: guides
      .filter((g) => matches(g.name) || matches(g.city) || matches(g.focus))
      .slice(0, 3),
  };
}
