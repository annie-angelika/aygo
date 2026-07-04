"use client";

// The featured-calendars manager: edit/delete each curated collection (name,
// artwork, interest) and add new ones. Owns the form sheet.

import { useState } from "react";
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarForm } from "@/components/admin/calendar-form";
import { useCalendars } from "@/hooks/use-discover";
import { adminDeleteCalendar } from "@/lib/api/admin";
import type { CalendarInfo } from "@/types";

export function ManageCalendars() {
  const { calendars, loading, refetch } = useCalendars();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarInfo | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(c: CalendarInfo) {
    if (!window.confirm(`Delete the "${c.name}" calendar?`)) return;
    setBusyId(c.id);
    try {
      await adminDeleteCalendar(c.id);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Featured calendars
        </h2>
        <Button
          size="sm"
          className="rounded-full text-[12px]"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <LuPlus className="size-3.5" aria-hidden /> New calendar
        </Button>
      </div>

      {loading && calendars.length === 0 ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
          {calendars.map((c, i) => (
            <div
              key={c.id}
              className={
                "flex items-center gap-2.5 px-3.5 py-2.5 " +
                (i > 0 ? "border-t border-border" : "")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.logo}
                alt=""
                className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {c.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.category ?? "All interests"} · {c.location}
                  {c.featured ? " · featured" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                aria-label={`Edit ${c.name}`}
                onClick={() => {
                  setEditing(c);
                  setOpen(true);
                }}
              >
                <LuPencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full text-destructive hover:text-destructive"
                aria-label={`Delete ${c.name}`}
                disabled={busyId === c.id}
                onClick={() => void remove(c)}
              >
                <LuTrash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <CalendarForm
        open={open}
        onOpenChange={setOpen}
        calendar={editing}
        onSaved={refetch}
      />
    </section>
  );
}
