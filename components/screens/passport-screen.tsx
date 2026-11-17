"use client";

import { useState } from "react";
import { LuShare2, LuStamp } from "react-icons/lu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/ui/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionBanner } from "@/components/passport/collection-banner";
import { CollectFab } from "@/components/passport/collect-fab";
import { StampBadge } from "@/components/passport/stamp-badge";
import { AygoStar } from "@/components/ui/brand-icons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StampModal } from "@/components/passport/stamp-modal";
import { groupAygosByMonth, monthsForYear, UNDATED_KEY } from "@/lib/aygos";
import { useMyCollection } from "@/hooks/use-me";
import { usePublicProfile } from "@/hooks/use-public-profile";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

/** What the collection page shows, whether it's yours or someone's public one. */
type CollectionView = {
  name: string;
  username: string | null;
  email: string | null;
  avatar: string;
  stamps: Stamp[];
  isSelf: boolean;
};

/**
 * An aygo collection — the real stamps, grouped by the month they were earned.
 * Yours without `username`; someone's public one (/u/<username>/collection)
 * with it.
 */
export function PassportScreen({ username }: { username?: string }) {
  return username ? <PublicCollection username={username} /> : <OwnCollection />;
}

function OwnCollection() {
  const { me, email, stamps } = useMyCollection();
  return (
    <Collection
      view={{ name: me.name, username: me.username, email, avatar: me.avatar, stamps, isSelf: true }}
    />
  );
}

function PublicCollection({ username }: { username: string }) {
  const { profile, loading, missing } = usePublicProfile(username);
  if (!profile) {
    return (
      <div className="px-4 pt-4 lg:mx-auto lg:w-full lg:max-w-xl lg:pt-8">
        {loading && !missing ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : (
          <EmptyState
            icon={LuStamp}
            title="Collection not found"
            subtitle={`Nobody on aygo goes by @${username}.`}
          />
        )}
      </div>
    );
  }
  return (
    <Collection
      view={{
        name: profile.name,
        username: profile.username,
        email: null,
        avatar: profile.avatar,
        stamps: profile.stamps,
        isSelf: false,
      }}
    />
  );
}

function Collection({ view }: { view: CollectionView }) {
  const { stamps, isSelf } = view;
  const [selected, setSelected] = useState<{
    stamp: Stamp;
    dateLabel: string;
  } | null>(null);
  const [year, setYear] = useState<string>("");

  // Only real collected aygos — an empty collection shows the empty state,
  // never demo filler.
  const months = groupAygosByMonth(stamps);
  const count = stamps.length;

  const dated = months.filter((m) => m.key !== UNDATED_KEY);
  const undated = months.find((m) => m.key === UNDATED_KEY);
  const years = [...new Set(dated.map((m) => m.key.slice(0, 4)))];
  const activeYear = year || years[0] || "";
  // Show the whole selected year, newest month first, quiet months included;
  // aygos with no known date close the list under "Earlier".
  const shown = [
    ...(activeYear ? monthsForYear(activeYear, dated) : []),
    ...(undated ? [undated] : []),
  ];
  const hasAny = months.some((m) => m.stamps.length > 0);

  return (
    <div className="flex flex-col pb-10">
      <CollectionHero count={count} view={view} />

      <div className="flex flex-col gap-5 px-4 pt-5 lg:px-8">
        {!hasAny ? (
          <EmptyState
            icon={LuStamp}
            title="No aygos yet"
            subtitle={
              isSelf
                ? "Check in at events to start collecting aygos."
                : `${view.name} hasn't collected any aygos yet.`
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
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
                className="absolute bottom-2 left-[7px] top-2 w-0.5 rounded bg-foreground/15"
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
 * The header of a collection: the navy star sky up top, the person's photo
 * overlapping it, their name and handle, the count of aygos they hold and —
 * once they have a handle to share — the share action at the far end.
 */
function CollectionHero({ count, view }: { count: number; view: CollectionView }) {
  const { name, username, email, avatar } = view;
  const shareUrl = username ? `/u/${username}/collection` : null;
  return (
    <div className="relative">
      <CollectionBanner className="lg:mx-4 lg:mt-4 lg:h-52 lg:overflow-hidden lg:rounded-3xl" />
      <BackButton
        fallback={view.isSelf ? "/profile" : username ? `/u/${username}` : "/discover"}
        className="absolute left-4 top-4 size-9 border-0 bg-white text-navy shadow-[0_6px_16px_-8px_rgba(9,25,53,0.5)] hover:bg-white lg:left-8 lg:top-8" />

      <div className="relative px-4 lg:px-8">
        {/* Your photo, lifted onto the banner's lower edge. */}
        <Avatar className="-mt-10 size-20 shadow-[0_8px_16px_-10px_rgba(9,25,53,0.4)] ring-4 ring-background">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-secondary text-[24px] font-bold tracking-[-0.03em] text-foreground">
            {name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-2.5 truncate text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-foreground">
          {name}
        </h1>
        {(username || email) && (
          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            {username ? `@${username}` : email}
          </p>
        )}

        {/* The count of aygos, and the share action at the opposite end of the line. */}
        <div className="mt-3.5 flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums text-foreground">
              {count.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground">
              <AygoStar className="size-3.5 text-gold" />
              aygos
            </span>
          </div>

          {shareUrl && (
            <ShareButton
              title={`${name} on aygo`}
              text={`Check out @${username}'s aygo collection`}
              url={shareUrl}
              copiedLabel="Copied!"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted active:translate-y-px"
            >
              <LuShare2 className="size-3.5" aria-hidden />
              Share
            </ShareButton>
          )}
        </div>
      </div>
    </div>
  );
}

/** One month on the timeline — a rail dot (gold when you collected), its label, then its stamps. */
function MonthSection({
  label,
  stamps,
  onSelect,
}: {
  label: string;
  stamps: Stamp[];
  onSelect: (stamp: Stamp, dateLabel: string) => void;
}) {
  const active = stamps.length > 0;
  return (
    <section className="relative flex flex-col gap-3">
      <span
        aria-hidden
        className="absolute -left-6 top-0.5 grid size-4 place-items-center rounded-full bg-background"
      >
        <span
          className={cn(
            "block size-2 rounded-full",
            active ? "bg-gold" : "bg-foreground/25",
          )}
        />
      </span>
      <h2
        className={cn(
          "text-[13px] font-semibold",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </h2>

      {active ? (
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 pt-1.5 sm:grid-cols-4 lg:grid-cols-6">
          {stamps.map((s) => (
            <StampBadge
              key={s.eventId}
              stamp={s}
              dateLabel={label}
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

/** What an inactive month looks like — one quiet line, not a dead end. */
function QuietMonth() {
  return (
    <p className="-mt-1 text-[12px] text-muted-foreground">
      A quiet month — nothing collected.
    </p>
  );
}
