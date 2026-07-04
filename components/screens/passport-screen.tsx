"use client";

import { useState } from "react";
import { LuStamp, LuMoon, LuShare2 } from "react-icons/lu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/ui/share-button";
import { CollectionBanner } from "@/components/passport/collection-banner";
import { CollectFab } from "@/components/passport/collect-fab";
import { AygoArt } from "@/components/passport/aygo-art";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StampModal } from "@/components/passport/stamp-modal";
import { CATEGORY_META } from "@/lib/events-data";
import { groupAygosByMonth, monthsForYear } from "@/lib/aygos";
import { useTraveler } from "@/hooks/use-traveler";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

export function PassportScreen({ username }: { username?: string }) {
  const { user, isSelf, displayStamps, loading } = useTraveler(username);
  const [selected, setSelected] = useState<{
    stamp: Stamp;
    dateLabel: string;
  } | null>(null);
  const [year, setYear] = useState<string>("");

  if (!user) {
    return (
      <div className="px-4 pt-4">
        {loading ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : (
          <EmptyState
            icon={LuStamp}
            title="Traveler not found"
            subtitle="This collection doesn't exist (or hasn't joined aygo yet)."
          />
        )}
      </div>
    );
  }

  // Only real collected aygos — an empty collection shows the empty state,
  // never demo filler.
  const months = groupAygosByMonth(displayStamps);
  const count = displayStamps.length;

  const years = [...new Set(months.map((m) => m.key.slice(0, 4)))];
  const activeYear = year || years[0] || "";
  // Show the whole selected year, newest month first, quiet months included.
  const shown = monthsForYear(activeYear, months);
  const hasAny = months.some((m) => m.stamps.length > 0);

  return (
    <div className="flex flex-col pb-10">
      <CollectionHero
        count={count}
        name={user.name}
        username={user.username}
        avatar={user.avatar}
        joined={user.joined}
      />

      <div className="flex flex-col gap-5 px-4 pt-5">
        {!hasAny ? (
          <EmptyState
            icon={LuStamp}
            title="No aygos yet"
            subtitle="Check in at events to start collecting aygos."
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold tracking-tight text-foreground">
                Your progress
              </p>
              {years.length > 1 && (
                <Select
                  value={activeYear}
                  onValueChange={(v) => setYear((v as string | null) ?? "")}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-auto gap-2 rounded-full bg-card px-3.5 font-semibold"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="relative flex flex-col gap-7 pl-6">
              {/* Continuous progress rail tying the months together. */}
              <span
                aria-hidden
                className="absolute bottom-2 left-[7px] top-2 w-0.5 rounded bg-foreground/20"
              />
              {shown.map((m) => (
                <MonthSection
                  key={m.key}
                  label={m.label}
                  stamps={m.stamps}
                  onSelect={(stamp, dateLabel) =>
                    setSelected({ stamp, dateLabel })
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      <StampModal
        stamp={selected?.stamp ?? null}
        dateLabel={selected?.dateLabel}
        onClose={() => setSelected(null)}
      />

      {/* Collect a new aygo — the gentle, web2 way to say "mint". A speed-dial
          pinned to the bottom-right of the phone frame, yours only. */}
      {isSelf && <CollectFab />}
    </div>
  );
}

/**
 * The header of a collection, POAP-style: a living, place-aware banner up top,
 * the traveler's photo overlapping it, then their name, the count of aygos they
 * hold, and — across a hairline — the share action at the far end.
 */
function CollectionHero({
  count,
  name,
  username,
  avatar,
  joined,
}: {
  count: number;
  name: string;
  username: string;
  avatar: string;
  joined: string;
}) {
  return (
    <div className="relative">
      <CollectionBanner count={count} />
      <BackButton className="absolute left-4 top-4 border-0 bg-white text-foreground shadow-md ring-1 ring-black/5 hover:bg-white" />

      <div className="px-4">
        {/* Your photo, lifted onto the banner's lower edge. */}
        <Avatar className="-mt-10 size-20 shadow-md ring-4 ring-background">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
        </Avatar>

        <h1 className="mt-2.5 truncate text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          {name}
        </h1>
        <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
          @{username} · since {joined}
        </p>

        {/* The count of aygos, and the share action at the opposite end of the line. */}
        <div className="mt-3.5 flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold leading-none tracking-tight tabular-nums text-foreground">
              {count.toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">
              aygos
            </span>
          </div>

          <ShareButton
            title={`${name} on aygo`}
            text={`Check out @${username}'s aygo collection`}
            copiedLabel="Copied!"
            className="inline-flex items-center gap-1.5 rounded-full bg-background px-3.5 py-2 text-[13px] font-semibold text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-muted active:translate-y-px"
          >
            <LuShare2 className="size-3.5" aria-hidden />
            Share
          </ShareButton>
        </div>
      </div>
    </div>
  );
}

/** One month on the timeline — a rail dot, its label, then its discs. */
function MonthSection({
  label,
  stamps,
  onSelect,
}: {
  label: string;
  stamps: Stamp[];
  onSelect: (stamp: Stamp, dateLabel: string) => void;
}) {
  return (
    <section className="relative flex flex-col gap-3">
      <span
        aria-hidden
        className="absolute -left-[22px] top-0.5 size-3 rounded-full bg-foreground ring-4 ring-background"
      />
      <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
        {label}
      </h2>

      {stamps.length > 0 ? (
        <div className="grid grid-cols-4 gap-x-3 gap-y-4">
          {stamps.map((s) => (
            <AygoBadge
              key={s.eventId}
              stamp={s}
              onSelect={(stamp) => onSelect(stamp, label)}
            />
          ))}
        </div>
      ) : (
        <QuietMonth />
      )}
    </section>
  );
}

/** What an inactive month looks like — a gentle nudge, not a dead end. */
function QuietMonth() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        <LuMoon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground/70">
          A quiet month
        </p>
        <p className="text-[11.5px] text-muted-foreground">
          No aygos collected. There&apos;s always next month.
        </p>
      </div>
    </div>
  );
}

/**
 * One collectible in the wall — tap to open its detail. Shows the aygo's image
 * (optimized + lazy-loaded so a long wall stays fast), falling back to the
 * category mark when there's no artwork yet.
 */
function AygoBadge({
  stamp,
  onSelect,
}: {
  stamp: Stamp;
  onSelect: (stamp: Stamp) => void;
}) {
  const { Icon, accent, soft } = CATEGORY_META[stamp.category];
  return (
    <button
      type="button"
      onClick={() => onSelect(stamp)}
      aria-label={stamp.title}
      className="flex flex-col items-center gap-1.5"
    >
      <span className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-full bg-card shadow-sm ring-1 ring-border transition-transform duration-200 hover:scale-105">
        <AygoArt
          image={stamp.image}
          blurDataURL={stamp.blurDataURL}
          alt=""
          // The wall is 4 columns inside the phone shell — each disc is small,
          // so request a small image (tiny srcset → minimal bytes).
          sizes="(max-width: 480px) 23vw, 96px"
          quality={45}
          fallback={
            <span
              className={cn("grid size-full place-items-center", soft, accent)}
            >
              <Icon className="size-6" aria-hidden />
            </span>
          }
        />
      </span>
      <span className="line-clamp-1 w-full text-center text-[9.5px] font-medium text-muted-foreground">
        {stamp.title}
      </span>
    </button>
  );
}
