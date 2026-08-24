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
import { CATEGORIES, CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";

export function TasteSettings({ compact = false }: { compact?: boolean }) {
  const { prefs, update, toggleInterest } = usePreferences();
  const { cities } = useCities();
  const interests = prefs.interests ?? [];

  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      <section className="flex flex-col gap-2">
        {!compact && <h2 className="text-[15px] font-semibold text-foreground">Interests</h2>}
        <p className="text-[12.5px] text-muted-foreground">
          {compact ? "What are you into?" : "Pick what you're into — Discover leans toward these."}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const { Icon, chip, accent } = CATEGORY_META[c];
            const on = interests.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => toggleInterest(c)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold ring-1 transition-colors",
                  on ? cn(chip, "ring-transparent") : "bg-card text-muted-foreground ring-border hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", on || accent)} aria-hidden />
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
          <SelectTrigger className="h-10 w-full rounded-xl bg-card px-3.5 text-[13px]">
            <SelectValue>{(v) => (v && v !== "none" ? (v as string) : "Choose a city")}</SelectValue>
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
