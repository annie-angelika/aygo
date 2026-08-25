import Link from "next/link";

import { AygoStar } from "@/components/ui/brand-icons";
import type { Calendar } from "@/lib/discover-data";

/** Featured-calendar carousel card: cover, overlaid logo, name, and blurb. */
export function CalendarCard({ calendar }: { calendar: Calendar }) {
  return (
    <Link
      href={`/${calendar.id}`}
      className="flex w-[250px] shrink-0 flex-col lg:w-auto overflow-hidden rounded-[20px] bg-card ring-1 ring-foreground/8 transition-colors hover:bg-accent/40"
    >
      <div className="relative h-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={calendar.cover} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/45 to-transparent" />
        {calendar.featured && (
          <span className="absolute left-2.5 top-2.5 inline-flex h-[22px] items-center gap-1 rounded-full bg-gold px-2 text-[10.5px] font-bold uppercase tracking-[0.04em] text-navy">
            <AygoStar className="size-[11px]" aria-hidden />
            Featured
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={calendar.logo}
          alt=""
          className="absolute -bottom-5 left-3 size-12 rounded-xl object-cover ring-2 ring-card"
        />
      </div>
      <div className="px-3 pb-3 pt-7">
        <p className="truncate text-[14px] font-semibold text-foreground">
          {calendar.name}
        </p>
        <p className="mb-0.5 truncate text-[11.5px] text-muted-foreground">
          {[calendar.location, calendar.category].filter(Boolean).join(" · ")}
        </p>
        <p className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">
          {calendar.description}
        </p>
      </div>
    </Link>
  );
}
