"use client";

// The host's landing tab: event recap, the going/checked-in pulse, and the
// freshest registrations — with the share link one tap away.

import { LuCalendar, LuClock, LuMapPin, LuTicket } from "react-icons/lu";

import { ShareButton } from "@/components/ui/share-button";
import { Stat } from "@/components/ui/stat";
import { GuestRow } from "@/components/manage/guest-row";
import { eventCode } from "@/lib/events-data";
import type { ManageData } from "@/lib/api/manage";

export function ManageOverview({
  data,
  onOpenGuests,
}: {
  data: ManageData;
  onOpenGuests: () => void;
}) {
  const { event } = data;
  const recent = data.going.slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.cover}
          alt=""
          className="h-36 w-full object-cover"
        />
        <div className="flex flex-col gap-2.5 p-4">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <LuCalendar className="size-4 shrink-0 text-amber-600" aria-hidden />
            {event.weekday}, {event.dayLabel}
          </p>
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <LuClock className="size-4 shrink-0 text-amber-600" aria-hidden />
            {event.timeLabel}
          </p>
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <LuMapPin className="size-4 shrink-0 text-amber-600" aria-hidden />
            <span className="truncate">
              {event.place}, {event.city}
            </span>
          </p>
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <LuTicket className="size-4 shrink-0 text-amber-600" aria-hidden />
            {event.price == null || event.price === 0
              ? "Free"
              : `Bs ${event.price}`}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-3 divide-x divide-border rounded-2xl bg-card ring-1 ring-border">
        <Stat
          value={<span className="text-emerald-600">{data.going.length}</span>}
          label="Going"
          className="items-center py-3.5"
        />
        <Stat
          value={data.checkedIn}
          label="Checked in"
          className="items-center py-3.5"
        />
        <Stat
          value={
            data.requests.length > 0 ? (
              <span className="text-amber-600">{data.requests.length}</span>
            ) : (
              0
            )
          }
          label="Pending"
          className="items-center py-3.5"
        />
      </section>

      <ShareButton
        title={event.title}
        text={`Join "${event.title}" on aygo`}
        copiedLabel="Link copied!"
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-card text-[13.5px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted"
      >
        Share event link
      </ShareButton>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            Recent registrations
          </h2>
          <button
            type="button"
            onClick={onOpenGuests}
            className="text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            All guests →
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl bg-card/60 px-4 py-6 text-center text-[12.5px] text-muted-foreground ring-1 ring-border">
            No registrations yet — share the link to get the first ones.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
            {recent.map((g, i) => (
              <div key={g.requestId} className={i > 0 ? "border-t border-border" : ""}>
                <GuestRow guest={g} />
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[11.5px] leading-snug text-muted-foreground">
        Your public page: <span className="font-semibold">/{eventCode(event.id)}</span>
      </p>
    </div>
  );
}
