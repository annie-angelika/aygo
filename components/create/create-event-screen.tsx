"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/top-bar";
import { AudienceRow } from "@/components/create/audience-row";
import { CoverCard } from "@/components/create/cover-card";
import { CreateSuccess } from "@/components/create/create-success";
import { EventOptions } from "@/components/create/event-options";
import { ImagePickerDialog } from "@/components/create/image-picker-dialog";
import { ThemeSheet } from "@/components/create/theme-sheet";
import { WhenCard } from "@/components/create/when-card";
import { WhereWhat } from "@/components/create/where-what";
import { CALENDARS, TIMEZONES, saveDraft, type Visibility } from "@/lib/create-event";
import { DEFAULT_THEME_ID, getTheme, type ThemeTone } from "@/lib/create-themes";
import { todayValue } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

/**
 * The Luma-style "Create Event" flow. The whole canvas takes on the selected
 * cover theme's ambient color; the shared top nav stays on top and flips light/
 * dark with the active display tone (via the `.dark` token toggle), so it always
 * reads against the background. Portalled menus/sheets/popovers inherit it too.
 */
export function CreateEventScreen() {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [fontId, setFontId] = useState(getTheme(DEFAULT_THEME_ID).font);
  const [styleId, setStyleId] = useState(getTheme(DEFAULT_THEME_ID).style);
  const [displayOverride, setDisplayOverride] = useState<ThemeTone | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [calendarId, setCalendarId] = useState(CALENDARS[0].id);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(`${todayValue()}T22:30`);
  const [end, setEnd] = useState(`${todayValue()}T23:30`);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [created, setCreated] = useState(false);

  const theme = getTheme(themeId);
  const tone: ThemeTone = displayOverride ?? theme.tone;

  // Reactively match the document's token mode to the active tone. Split from the
  // restore so switching themes never flashes the default in between (the flicker).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", tone === "dark");
  }, [tone]);
  useEffect(() => {
    return () => document.documentElement.classList.remove("dark");
  }, []);

  // Picking a theme adopts its coordinated font/style/tone; each stays overridable.
  function changeTheme(id: string) {
    const t = getTheme(id);
    setThemeId(id);
    setFontId(t.font);
    setStyleId(t.style);
    setDisplayOverride(null);
  }

  function create() {
    saveDraft({
      id: crypto.randomUUID(),
      title: title.trim() || "Untitled Event",
      theme: themeId,
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
    <div className={cn("min-h-svh overflow-x-hidden pb-28 text-foreground transition-colors", theme.page)}>
      <TopBar />

      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-3">
        <CoverCard
          themeId={themeId}
          fontId={fontId}
          styleId={styleId}
          cover={cover}
          onPickImage={() => setPickerOpen(true)}
        />

        <ThemeSheet
          themeId={themeId}
          onThemeChange={changeTheme}
          fontId={fontId}
          onFontChange={setFontId}
          styleId={styleId}
          onStyleChange={setStyleId}
          display={tone}
          onToggleDisplay={() => setDisplayOverride(tone === "dark" ? "light" : "dark")}
        />

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

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-5 pt-4">
        <Button
          size="lg"
          onClick={create}
          className="h-12 w-full rounded-full bg-foreground text-[15px] font-semibold text-background shadow-[0_12px_24px_-12px_rgba(0,0,0,0.5)] hover:bg-foreground/90"
        >
          Create Event
        </Button>
      </div>

      <ImagePickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={setCover} />
    </div>
  );
}
