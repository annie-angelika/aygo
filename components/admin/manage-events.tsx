"use client";

// The events manager, built to stay usable at a thousand events: search across
// title/city/place/host, an Upcoming/Past filter, and a paged list ("Show
// more") so the screen never drowns. Owns the create/edit form sheet.

import { useState } from "react";
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "@/components/admin/event-form";
import { ActionError } from "@/components/admin/action-error";
import { useAdminEvents } from "@/hooks/use-admin";
import { adminDeleteEvent } from "@/lib/api/admin";
import type { AygoEvent } from "@/types";

const PAGE = 25;
type When = "all" | "upcoming" | "past";

export function ManageEvents({ onChanged }: { onChanged: () => void }) {
  const { data: events, loading, refetch } = useAdminEvents();
  const [query, setQuery] = useState("");
  const [when, setWhen] = useState<When>("all");
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AygoEvent | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = events
    .filter((e) => (when === "all" ? true : when === "past" ? e.isPast : !e.isPast))
    .filter(
      (e) =>
        !q ||
        [e.title, e.city, e.place, e.host.name].some((f) =>
          f.toLowerCase().includes(q),
        ),
    );
  const shown = filtered.slice(0, limit);

  const changed = () => {
    refetch();
    onChanged();
  };

  async function remove(e: AygoEvent) {
    if (!window.confirm(`Delete "${e.title}"? RSVPs and aygos for it go too.`))
      return;
    setBusyId(e.id);
    setError(null);
    try {
      await adminDeleteEvent(e.id);
      changed();
    } catch {
      setError(`Couldn't delete "${e.title}" — try again.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <LuSearch
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, city, place, host…"
            aria-label="Search events"
            className="pl-9"
          />
        </div>
        <Button
          size="sm"
          className="shrink-0 rounded-full text-[12px]"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <LuPlus className="size-3.5" aria-hidden /> New
        </Button>
      </div>

      <Tabs value={when} onValueChange={(v) => setWhen(v as When)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ActionError message={error} />
      <p className="text-[11.5px] text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "event" : "events"}
        {q ? ` matching “${query.trim()}”` : ""}
      </p>

      {loading && events.length === 0 ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
          {shown.length === 0 && (
            <p className="px-3.5 py-6 text-center text-[12.5px] text-muted-foreground">
              No events match — try another search or filter.
            </p>
          )}
          {shown.map((e, i) => (
            <div
              key={e.id}
              className={
                "flex items-center gap-2 px-3.5 py-2.5 " +
                (i > 0 ? "border-t border-border" : "")
              }
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {e.title}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {e.category} · {e.city} · {e.dayLabel} {e.timeLabel}
                  {e.isPast ? " · past" : ""}
                  {e.visibility === "private" ? " · private (link only)" : ""} · {e.attendees} going
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                aria-label={`Edit ${e.title}`}
                onClick={() => {
                  setEditing(e);
                  setOpen(true);
                }}
              >
                <LuPencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full text-destructive hover:text-destructive"
                aria-label={`Delete ${e.title}`}
                disabled={busyId === e.id}
                onClick={() => void remove(e)}
              >
                <LuTrash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {filtered.length > limit && (
        <Button
          variant="outline"
          className="h-10 rounded-full text-[13px]"
          onClick={() => setLimit((n) => n + PAGE)}
        >
          Show {Math.min(PAGE, filtered.length - limit)} more
        </Button>
      )}

      <EventForm
        open={open}
        onOpenChange={setOpen}
        event={editing}
        onSaved={changed}
      />
    </section>
  );
}
