"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { AudienceRow } from "@/components/create/audience-row";
import { CoverCard } from "@/components/create/cover-card";
import { CreateSuccess } from "@/components/create/create-success";
import { EventOptions } from "@/components/create/event-options";
import { ImagePickerDialog } from "@/components/create/image-picker-dialog";
import { ThemeControl } from "@/components/create/theme-control";
import { WhenCard } from "@/components/create/when-card";
import { WhereWhat } from "@/components/create/where-what";
import {
  CALENDARS,
  TIMEZONES,
  saveDraft,
  type ThemeId,
  type Visibility,
} from "@/lib/create-event";

/**
 * The Luma-style "Create Event" flow. A dark, immersive canvas (it forces dark
 * tokens for its whole lifetime so portalled menus/dialogs match) where you set
 * the cover, theme, audience, schedule, and ticketing, then publish.
 */
export function CreateEventScreen() {
  const [theme, setTheme] = useState<ThemeId>("minimal");
  const [cover, setCover] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [calendarId, setCalendarId] = useState(CALENDARS[0].id);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("2026-06-22T22:30");
  const [end, setEnd] = useState("2026-06-22T23:30");
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [created, setCreated] = useState(false);

  // Force dark tokens for the whole route so portalled popups match the canvas.
  useEffect(() => {
    const root = document.documentElement;
    const had = root.classList.contains("dark");
    root.classList.add("dark");
    return () => {
      if (!had) root.classList.remove("dark");
    };
  }, []);

  function create() {
    saveDraft({
      id: crypto.randomUUID(),
      title: title.trim() || "Untitled Event",
      theme,
      cover,
      calendarId,
      visibility,
      startsAt: start,
      endsAt: end,
      timezone,
      location: location.trim(),
      description: description.trim(),
      price,
      requiresApproval,
      capacity,
      createdAt: new Date().toISOString(),
    });
    setCreated(true);
  }

  if (created) return <CreateSuccess title={title.trim() || "Untitled Event"} />;

  return (
    <div className="min-h-svh overflow-x-hidden bg-background pb-28 text-foreground">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3">
        <Link
          href="/home"
          aria-label="Close"
          className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
        >
          <LuX className="size-[18px]" aria-hidden />
        </Link>
        <span className="text-[17px] font-bold tracking-tight text-foreground">
          aygo<span className="text-amber-500">.</span>
        </span>
        <span className="size-9" aria-hidden />
      </header>

      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-2">
        <CoverCard theme={theme} cover={cover} onPickImage={() => setPickerOpen(true)} />

        <ThemeControl theme={theme} onThemeChange={setTheme} />

        <AudienceRow
          calendarId={calendarId}
          onCalendarChange={setCalendarId}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Name"
          aria-label="Event name"
          className="w-full bg-transparent text-[30px] font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
        />

        <WhenCard
          start={start}
          end={end}
          timezone={timezone}
          onStart={setStart}
          onEnd={setEnd}
          onTimezone={setTimezone}
        />

        <WhereWhat
          location={location}
          onLocation={setLocation}
          description={description}
          onDescription={setDescription}
        />

        <EventOptions
          price={price}
          onPrice={setPrice}
          requiresApproval={requiresApproval}
          onApproval={setRequiresApproval}
          capacity={capacity}
          onCapacity={setCapacity}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md bg-gradient-to-t from-background via-background to-transparent px-4 pb-5 pt-4">
        <Button
          size="lg"
          onClick={create}
          className="h-12 w-full rounded-full bg-foreground text-[15px] font-semibold text-background hover:bg-foreground/90"
        >
          Create Event
        </Button>
      </div>

      <ImagePickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={setCover} />
    </div>
  );
}
