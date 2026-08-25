"use client";

// Interests + home city — the two signals behind "For you". Auto-persists like
// the rest of Preferences. `compact` drops the headings for the welcome sheet.

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { usePreferences } from "@/hooks/use-preferences";
import { useCities } from "@/hooks/use-discover";
import { CITIES } from "@/lib/cities-data";
import { CATEGORIES, CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";

export function TasteSettings({ compact = false }: { compact?: boolean }) {
  const { prefs, update, toggleInterest } = usePreferences();
  const { cities } = useCities();
  const interests = prefs.interests ?? [];
  const HomeMark = CITIES.find((c) => c.name === prefs.homeCity)?.Icon ?? null;

  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      <section className="flex flex-col gap-2">
        {!compact && <h2 className="text-[15px] font-semibold text-foreground">Interests</h2>}
        <p className="text-[12.5px] text-muted-foreground">
          {compact ? "What are you into?" : "Pick what you're into — Discover leans toward these."}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const { Icon } = CATEGORY_META[c];
            const on = interests.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => toggleInterest(c)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full pl-2.5 pr-3.5 text-[13px] font-semibold ring-1 transition-colors",
                  on
                    ? "bg-primary text-primary-foreground ring-transparent"
                    : "bg-card text-foreground ring-border hover:bg-secondary/60",
                )}
              >
                <Icon className={cn("size-4", on ? "text-gold" : "text-foreground")} aria-hidden />
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        {!compact && <h2 className="text-[15px] font-semibold text-foreground">Home city</h2>}
        <p className="text-[12.5px] text-muted-foreground">
          {compact ? "Where should we look first?" : "Events here come first in your recommendations."}
        </p>
        <Select
          value={prefs.homeCity ?? "none"}
          onValueChange={(v) => update({ homeCity: !v || v === "none" ? undefined : (v as string) })}
        >
          <SelectTrigger className="h-11 w-full rounded-xl bg-card px-3 text-[13px] font-semibold">
            <span className="flex min-w-0 items-center gap-2.5">
              {HomeMark && (
                <span
                  className="grid size-[26px] shrink-0 place-items-center rounded-[7px] bg-primary text-primary-foreground"
                  aria-hidden
                >
                  <HomeMark className="size-[15px]" />
                </span>
              )}
              <SelectValue>{(v) => (v && v !== "none" ? (v as string) : "Choose a city")}</SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="none">No home city</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.slug} value={c.name}>
                {c.name}, {c.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </div>
  );
}
