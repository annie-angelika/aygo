"use client";

import { useEffect, useRef, useState } from "react";
import { LuMapPin, LuVideo, LuInfo, LuSearch, LuLoaderCircle } from "react-icons/lu";

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";

/** A place suggestion from /api/geocode/search (mirrors server PlaceHit). */
type PlaceHit = { name: string; city: string; label: string; lat: number; lng: number };

/** Extra location facts a picked search result carries up to the form. */
export type LocationMeta = { city?: string; lat?: number; lng?: number };

type Place = { name: string; address: string };

const VIRTUAL: Place[] = [
  { name: "Create Zoom meeting", address: "zoom" },
  { name: "Create Google Meet", address: "meet" },
];

/**
 * Location picker with a live place search (OpenStreetMap, via
 * /api/geocode/search) plus virtual-link options. Picking a real result hands
 * the form its coordinates and city, so the pin and the city bucket are right
 * without the host typing "Place, City". `city` biases the search.
 */
export function LocationField({
  value,
  city,
  onSelect,
}: {
  value: string;
  city?: string;
  onSelect: (value: string, meta?: LocationMeta) => void;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  // Debounced search driven off the input: wait for a pause in typing (Nominatim
  // allows ~1 req/s) and ignore a stale response if the query moved on since.
  function onQuery(next: string) {
    setQuery(next);
    const q = next.trim();
    if (timer.current) clearTimeout(timer.current);
    const id = ++reqId.current;
    if (q.length < 3) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q });
        if (city) params.set("city", city);
        const res = await fetch(`/api/geocode/search?${params}`);
        const data: PlaceHit[] = res.ok ? await res.json() : [];
        if (id === reqId.current) setHits(data);
      } catch {
        if (id === reqId.current) setHits([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 450);
  }

  // Drop a pending request if the field unmounts mid-search.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const reset = () => {
    reqId.current++;
    if (timer.current) clearTimeout(timer.current);
    setQuery("");
    setHits([]);
    setLoading(false);
  };

  return (
    <Popover onOpenChange={(o) => !o && reset()}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl bg-muted px-3.5 py-3 text-left ring-1 ring-border transition-colors hover:bg-muted/70 data-popup-open:ring-2 data-popup-open:ring-ring"
          >
            <LuMapPin className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-foreground">
                {value || "Add Event Location"}
              </span>
              {!value && (
                <span className="block text-[12px] text-muted-foreground/70">
                  Search a place or paste a virtual link
                </span>
              )}
            </span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-(--anchor-width) p-2">
        <div className="mb-1 flex items-center gap-2 rounded-xl bg-background px-3 ring-1 ring-border">
          <LuSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search a place or paste a virtual link"
            className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <LuLoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          )}
        </div>

        {hits.length > 0 && (
          <Section title="Places">
            {hits.map((p) => (
              <Row
                key={`${p.lat},${p.lng}`}
                icon={<LuMapPin className="size-4" aria-hidden />}
                onClick={() =>
                  onSelect(p.name, { city: p.city || undefined, lat: p.lat, lng: p.lng })
                }
              >
                <span className="block truncate text-[13.5px] font-medium text-foreground">{p.name}</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">{p.label}</span>
              </Row>
            ))}
          </Section>
        )}

        {query.trim().length >= 3 && !loading && hits.length === 0 && (
          <Section title="Custom">
            <Row icon={<LuMapPin className="size-4" aria-hidden />} onClick={() => onSelect(query.trim())}>
              <span className="block truncate text-[13.5px] font-medium text-foreground">
                Use &ldquo;{query.trim()}&rdquo;
              </span>
              <span className="block truncate text-[11.5px] text-muted-foreground">
                No match found — keep it as typed
              </span>
            </Row>
          </Section>
        )}

        <Section title="Virtual Options">
          {VIRTUAL.map((v) => (
            <Row
              key={v.name}
              icon={<LuVideo className="size-4" aria-hidden />}
              onClick={() => onSelect(v.name)}
            >
              <span className="block truncate text-[13.5px] font-medium text-foreground">{v.name}</span>
            </Row>
          ))}
        </Section>

        <p className="flex gap-2 px-2 pt-1.5 text-[11.5px] text-muted-foreground">
          <LuInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Have a virtual event? Paste its link above and pick “Use …”.
        </p>
      </PopoverContent>
    </Popover>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-1">
      <p className="px-2 pb-0.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <PopoverClose
      render={
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
        >
          {icon}
          <span className="min-w-0 flex-1">{children}</span>
        </button>
      }
    />
  );
}
