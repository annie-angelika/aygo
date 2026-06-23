"use client";

import { useState } from "react";
import { LuStamp, LuMoon } from "react-icons/lu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
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
import {
  groupAygosByMonth,
  demoCollectionByMonth,
  DEMO_AYGO_COUNT,
} from "@/lib/aygos";
import { useTraveler } from "@/hooks/use-traveler";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

export function PassportScreen({ username }: { username?: string }) {
  const { user, isSelf, displayStamps } = useTraveler(username);
  const [selected, setSelected] = useState<{
    stamp: Stamp;
    dateLabel: string;
  } | null>(null);
  const [year, setYear] = useState<string>("");

  const hasReal = displayStamps.length > 0;

  // Real collected aygos when you have them; otherwise a fuller demo wall so
  // the collection reads alive (only on your own page).
  const months = hasReal
    ? groupAygosByMonth(displayStamps)
    : isSelf
      ? demoCollectionByMonth()
      : [];
  const count = hasReal
    ? displayStamps.length
    : isSelf
      ? DEMO_AYGO_COUNT
      : 0;

  const years = [...new Set(months.map((m) => m.key.slice(0, 4)))];
  const activeYear = year || years[0] || "";
  const shown = months.filter((m) => m.key.startsWith(activeYear));
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
    </div>
  );
}

/** Full-bleed warm banner: the traveler on the left, the big collected count on the right. */
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
    <div className="relative overflow-hidden rounded-b-[2rem] bg-card px-5 pb-8 pt-12 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.25)] ring-1 ring-border">
      <LuStamp
        className="pointer-events-none absolute -right-3 -top-1 size-36 rotate-12 text-foreground/[0.035]"
        aria-hidden
      />

      {/* Centered title, back button pinned left. */}
      <div className="relative flex items-center justify-center">
        <BackButton className="absolute left-0 ring-1 ring-border" />
        <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
          Collection
        </h1>
      </div>

      {/* Traveler on the left, the big count on the right. */}
      <div className="relative mt-8 flex items-center justify-between gap-4">
        <div className="flex min-w-0 shrink flex-col items-center gap-2 text-center">
          <Avatar className="size-20 shadow-sm ring-2 ring-background">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="max-w-24 truncate text-[12px] font-medium text-muted-foreground">
            @{username}
          </span>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            You collected
          </p>
          <div className="mt-1 flex items-baseline justify-end gap-2">
            <span className="text-[56px] font-bold leading-none tracking-tight tabular-nums text-foreground">
              {count.toLocaleString()}
            </span>
            <span className="text-[16px] font-semibold lowercase tracking-wide text-foreground/55">
              aygos
            </span>
          </div>
          <p className="mt-2.5 text-[11px] text-muted-foreground/80">
            since {joined}
          </p>
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
 * One collectible in the wall — tap to open its detail. The white disc is a
 * placeholder for the photo the host will set; until then it shows the
 * category mark.
 */
function AygoBadge({
  stamp,
  onSelect,
}: {
  stamp: Stamp;
  onSelect: (stamp: Stamp) => void;
}) {
  const { Icon, accent } = CATEGORY_META[stamp.category];
  return (
    <button
      type="button"
      onClick={() => onSelect(stamp)}
      aria-label={stamp.title}
      className="flex flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "grid aspect-square w-full place-items-center rounded-full bg-card shadow-sm ring-1 ring-border transition-transform duration-200 hover:scale-105",
          accent,
        )}
      >
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="line-clamp-1 w-full text-center text-[9.5px] font-medium text-muted-foreground">
        {stamp.title}
      </span>
    </button>
  );
}
