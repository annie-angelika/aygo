import Link from "next/link";
import { LuMapPin } from "react-icons/lu";

import type { Calendar } from "@/lib/discover-data";

/** Featured-calendar carousel card: cover, overlaid logo, name, and blurb. */
export function CalendarCard({ calendar }: { calendar: Calendar }) {
  return (
    <Link
      href={`/${calendar.id}`}
      className="flex w-[250px] shrink-0 flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-colors hover:bg-accent/40"
    >
      <div className="relative h-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={calendar.cover} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
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
        {calendar.location && (
          <p className="mb-0.5 inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <LuMapPin className="size-3" aria-hidden />
            {calendar.location}
          </p>
        )}
        <p className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">
          {calendar.description}
        </p>
      </div>
    </Link>
  );
}
