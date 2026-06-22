"use client";

import { useState } from "react";
import { LuStamp, LuPencil, LuCheck } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StampGrid } from "@/components/passport/stamp-grid";
import { StampModal } from "@/components/passport/stamp-modal";
import { useTraveler } from "@/hooks/use-traveler";
import { useFeatured, MAX_FEATURED } from "@/hooks/use-featured";
import type { Stamp } from "@/types";

export function PassportScreen({ username }: { username?: string }) {
  const { user, isSelf, displayStamps } = useTraveler(username);
  const { featured, toggle } = useFeatured();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Stamp | null>(null);

  const firstName = user.name.split(" ")[0];
  const hasReal = displayStamps.length > 0;

  // With nothing collected yet, preview the layout using your route stops.
  const preview: Stamp[] = user.visits.slice(0, 6).map((v) => ({
    eventId: v.id,
    title: v.place,
    category: v.category,
  }));
  const stamps = hasReal ? displayStamps : isSelf ? preview : [];

  const featuredStamps = featured.length
    ? stamps.filter((s) => featured.includes(s.eventId))
    : stamps.slice(0, MAX_FEATURED);
  const slots = Math.max(8, Math.ceil((stamps.length + 1) / 4) * 4);

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <div className="flex items-center gap-3">
        <BackButton className="ring-1 ring-border" />
        <h1 className="text-[20px] font-semibold leading-tight tracking-tight text-foreground">
          {isSelf ? "Your Passport" : `${firstName}'s Passport`}
        </h1>
      </div>

      {!stamps.length ? (
        <EmptyState
          icon={LuStamp}
          title="No stamps yet"
          subtitle="Check in at events to start filling your passport."
        />
      ) : (
        <>
          {!hasReal && (
            <p className="text-[11.5px] text-muted-foreground">
              Preview — this is how your passport fills up. Check in at events to
              earn real stamps.
            </p>
          )}

          {isSelf && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                  Featured
                </h2>
                {hasReal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing((e) => !e)}
                    className="rounded-full"
                  >
                    {editing ? (
                      <>
                        <LuCheck className="size-3.5" /> Done
                      </>
                    ) : (
                      <>
                        <LuPencil className="size-3.5" /> Edit
                      </>
                    )}
                  </Button>
                )}
              </div>
              {editing ? (
                <p className="text-[11.5px] text-muted-foreground">
                  Tap stamps below to feature your favorites ({featured.length}/
                  {MAX_FEATURED}).
                </p>
              ) : (
                <StampGrid
                  stamps={featuredStamps}
                  slots={featuredStamps.length}
                  onSelect={setSelected}
                />
              )}
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
              All stamps
            </h2>
            <StampGrid
              stamps={stamps}
              slots={slots}
              featuredIds={featured}
              showToggle={editing}
              onSelect={editing ? (s) => toggle(s.eventId) : setSelected}
            />
          </section>
        </>
      )}

      <StampModal stamp={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
