import { guides } from "@/lib/mock-data";
import type { Guide } from "@/types";

export async function fetchGuides(): Promise<Guide[]> {
  // TODO(backend): const res = await fetch('/api/guides'); return res.json();
  return guides;
}
