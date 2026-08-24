"use client";

import { useEvents } from "@/hooks/use-events";
import { usePreferences } from "@/hooks/use-preferences";
import { useRegistrations } from "@/hooks/use-registrations";
import { recommend, tasteFrom, hasTaste } from "@/lib/recommend";

/** The personalized "For you" list, from saved interests + city + RSVPs. */
export function useRecommendations(limit = 6) {
  const { data, loading } = useEvents();
  const { prefs } = usePreferences();
  const { going, hydrated } = useRegistrations();
  const taste = tasteFrom(prefs, going);
  return {
    loading,
    hydrated,
    personalized: hasTaste(taste),
    events: recommend(data, taste, limit),
  };
}
