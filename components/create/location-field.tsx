"use client";

import { useState } from "react";
import { LuMapPin, LuVideo, LuInfo, LuSearch } from "react-icons/lu";

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";

type Place = { name: string; address: string };

const RECENT: Place[] = [
  { name: "Condominio SKY Elite", address: "9 Oeste 17, Santa Cruz de la Sierra, Bolivia" },
  { name: "Nur University", address: "Av. Cristo Redentor N° 100, Santa Cruz de la Sierra, Bolivia" },
  { name: "UPB Campus Santa Cruz", address: "5QJ8+7J2, Unnamed Road, Santa Cruz de la Sierra, Bolivia" },
];

const VIRTUAL: Place[] = [
  { name: "Create Zoom meeting", address: "zoom" },
  { name: "Create Google Meet", address: "meet" },
];

/** Location picker with a search box, recent places, and virtual link options. */
export function LocationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const results = RECENT.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Popover onOpenChange={(o) => !o && setQuery("")}>
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
                  Offline location or virtual link
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter location or virtual link"
            className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {results.length > 0 && (
          <Section title="Recent Locations">
            {results.map((p) => (
              <Row key={p.name} icon={<LuMapPin className="size-4" aria-hidden />} onClick={() => onChange(p.name)}>
                <span className="block truncate text-[13.5px] font-medium text-foreground">{p.name}</span>
                <span className="block truncate text-[11.5px] text-muted-foreground">{p.address}</span>
              </Row>
            ))}
          </Section>
        )}

        {query.trim() && (
          <Section title="Custom">
            <Row icon={<LuMapPin className="size-4" aria-hidden />} onClick={() => onChange(query.trim())}>
              <span className="block truncate text-[13.5px] font-medium text-foreground">
                Use &ldquo;{query.trim()}&rdquo;
              </span>
            </Row>
          </Section>
        )}

        <Section title="Virtual Options">
          {VIRTUAL.map((v) => (
            <Row
              key={v.name}
              icon={<LuVideo className="size-4" aria-hidden />}
              onClick={() => onChange(v.name)}
            >
              <span className="block truncate text-[13.5px] font-medium text-foreground">{v.name}</span>
            </Row>
          ))}
        </Section>

        <p className="flex gap-2 px-2 pt-1.5 text-[11.5px] text-muted-foreground">
          <LuInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          If you have a virtual event link, you can enter or paste it above.
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
