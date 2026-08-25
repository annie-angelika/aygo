"use client";

import { useEffect, useRef, useState } from "react";
import { LuCheck, LuChevronDown, LuLoaderCircle, LuMapPin, LuSearch } from "react-icons/lu";

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import { CITIES, DEPARTMENT_CAPITALS, withCityMeta } from "@/lib/cities-data";
import { useCities } from "@/hooks/use-discover";
import { cn } from "@/lib/utils";

/** A town from /api/geocode/search?kind=city (mirrors the server's SettlementHit). */
type Town = { name: string; state: string; lat: number; lng: number };

const CAPITALS = DEPARTMENT_CAPITALS.map((slug) => CITIES.find((c) => c.slug === slug)).filter(
  (c): c is NonNullable<typeof c> => c != null,
);

/**
 * City picker for the create flow. Bolivia's nine department capitals come
 * first, with their marks; below them, any other town that already hosts
 * events; and, for everything else, a search over every city and town in
 * Bolivia — pick one and it becomes a real city in aygo (its own page, its own
 * spot in the explorer) the moment the event is created.
 */
export function CitySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { cities: live } = useCities();
  const Mark = CITIES.find((c) => c.name === value)?.Icon ?? LuMapPin;
  // Towns that already exist in the app but aren't capitals (El Alto, a town
  // a host added…): only those that have something on, to keep the list short.
  const others = live
    .filter((c) => c.country === "Bolivia" && !DEPARTMENT_CAPITALS.includes(c.slug as never))
    .filter((c) => c.eventCount > 0 || c.name === value)
    .map(withCityMeta);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-12 w-full items-center gap-2.5 rounded-2xl bg-card px-3 text-left text-[14px] font-semibold text-foreground ring-1 ring-border outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted/40"
          >
            <span
              className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden
            >
              <Mark className="size-[15px]" />
            </span>
            <span className="min-w-0 flex-1 truncate">{value || "Select city"}</span>
            <LuChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        }
      />
      <PopoverContent align="start" className="w-(--anchor-width) p-2">
        <div className="max-h-[60svh] overflow-y-auto">
          <Section title="Department capitals">
            {CAPITALS.map((c) => (
              <CityRow
                key={c.slug}
                name={c.name}
                selected={c.name === value}
                icon={<c.Icon className="size-4" aria-hidden />}
                onPick={() => onChange(c.name)}
              />
            ))}
          </Section>

          {others.length > 0 && (
            <Section title="More cities">
              {others.map((c) => (
                <CityRow
                  key={c.slug}
                  name={c.name}
                  selected={c.name === value}
                  icon={<c.Icon className="size-4" aria-hidden />}
                  onPick={() => onChange(c.name)}
                />
              ))}
            </Section>
          )}

          <OtherCity onPick={onChange} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** "Can't find your city?" — search every town in Bolivia and pick it. */
function OtherCity({ onPick }: { onPick: (name: string) => void }) {
  const [query, setQuery] = useState("");
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  function search(next: string) {
    setQuery(next);
    if (timer.current) clearTimeout(timer.current);
    const id = ++reqId.current;
    const q = next.trim();
    if (q.length < 2) {
      setTowns([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?kind=city&q=${encodeURIComponent(q)}`);
        const data: Town[] = res.ok ? await res.json() : [];
        if (id === reqId.current) setTowns(data);
      } catch {
        if (id === reqId.current) setTowns([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <Section title="Can't find your city?">
      <div className="mx-1 mb-1 flex items-center gap-2 rounded-xl bg-background px-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        <LuSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Any city or town in Bolivia"
          aria-label="Search another city"
          className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {loading && (
          <LuLoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        )}
      </div>
      {towns.map((t) => (
        <CityRow
          key={`${t.name}-${t.lat}`}
          name={t.name}
          meta={t.state}
          icon={<LuMapPin className="size-4" aria-hidden />}
          onPick={() => onPick(t.name)}
        />
      ))}
      {query.trim().length >= 2 && !loading && towns.length === 0 && (
        <p className="px-2 py-2 text-[12px] text-muted-foreground">
          Nothing by that name in Bolivia — check the spelling.
        </p>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-1">
      <p className="px-2 pb-0.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-deep">
        {title}
      </p>
      {children}
    </div>
  );
}

function CityRow({
  name,
  meta,
  icon,
  selected = false,
  onPick,
}: {
  name: string;
  meta?: string;
  icon: React.ReactNode;
  selected?: boolean;
  onPick: () => void;
}) {
  return (
    <PopoverClose
      render={
        <button
          type="button"
          onClick={onPick}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted",
            selected && "bg-secondary",
          )}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            {icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-medium text-foreground">{name}</span>
            {meta && (
              <span className="block truncate text-[11.5px] text-muted-foreground">{meta}</span>
            )}
          </span>
          {selected && <LuCheck className="size-4 shrink-0 text-gold-deep" aria-hidden />}
        </button>
      }
    />
  );
}
