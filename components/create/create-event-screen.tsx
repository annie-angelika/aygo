"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/top-bar";
import { AudienceRow } from "@/components/create/audience-row";
import { CoverCard } from "@/components/create/cover-card";
import { CreateSuccess } from "@/components/create/create-success";
import { EventOptions } from "@/components/create/event-options";
import { ImagePickerDialog } from "@/components/create/image-picker-dialog";
import { PhotosStrip } from "@/components/create/photos-strip";
import { ThemeSheet } from "@/components/create/theme-sheet";
import { WhenCard, whenProblem } from "@/components/create/when-card";
import { WhereWhat } from "@/components/create/where-what";
import { CategorySelect } from "@/components/create/category-select";
import type { LocationMeta } from "@/components/create/location-field";
import { CALENDARS, TIMEZONES, MAX_IMAGES, type Visibility } from "@/lib/create-event";
import { CITY_DATA, findCityByName } from "@/lib/cities-data";
import type { Category } from "@/types";
import { DEFAULT_THEME_ID, getTheme, type ThemeTone } from "@/lib/create-themes";
import { createEvent, ApiError } from "@/lib/api";
import { useMutation } from "@/hooks/use-mutation";
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
  const [images, setImages] = useState<string[]>([]);
  const [coverPosition, setCoverPosition] = useState("50% 50%");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [calendarId, setCalendarId] = useState(CALENDARS[0].id);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Party");
  const [start, setStart] = useState(() => defaultStart());
  const [end, setEnd] = useState(() => defaultEnd());
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [city, setCity] = useState(CITY_DATA[0].name); // La Paz — now visible & changeable
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const theme = getTheme(themeId);
  const tone: ThemeTone = displayOverride ?? theme.tone;
  const cover = images[0] ?? null;

  // Picking a real search result carries its coordinates (for the pin) and, when
  // it's one of our known cities (by any of its names), snaps the city selector.
  function handleLocation(loc: string, meta?: LocationMeta) {
    setLocation(loc);
    setCoords(
      meta?.lat != null && meta?.lng != null ? { lat: meta.lat, lng: meta.lng } : null,
    );
    const known = meta?.city ? findCityByName(meta.city) : undefined;
    if (known) setCity(known.name);
  }

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

  // Local-first: `createEvent` persists the draft instantly, then syncs to the
  // backend. `useMutation` tracks pending/error so the button can disable while
  // the sync is in flight, and the server's reason shows under it if it refuses.
  const { mutate: submit, pending, error, reset } = useMutation(createEvent);

  // The minimum a real event needs before it can exist: a name, a place and a
  // date that hasn't passed. The button doubles as the hint for what's missing.
  const missing = !title.trim()
    ? "Name your event"
    : !location.trim()
      ? "Add a location"
      : whenProblem(start, end);

  async function create() {
    if (missing) return;
    const id = crypto.randomUUID();
    try {
      await submit({
        id,
        title: title.trim(),
        theme: themeId,
        cover,
        images,
        coverPosition,
        calendarId,
        visibility,
        category,
        startsAt: start,
        endsAt: end,
        timezone,
        city,
        location: location.trim(),
        ...(coords ? { lat: coords.lat, lng: coords.lng } : null),
        description: description.trim(),
        price,
        requiresApproval,
        capacity,
        createdAt: new Date().toISOString(),
      });
      setCreatedId(id);
    } catch {
      /* surfaced via `error` below */
    }
  }

  if (createdId) return <CreateSuccess title={title.trim()} id={createdId} />;

  return (
    <div className={cn("min-h-svh overflow-x-hidden pb-32 text-foreground", theme.page)}>
      <TopBar />

      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-3">
        <CoverCard
          themeId={themeId}
          cover={cover}
          position={coverPosition}
          onPosition={setCoverPosition}
          onPickImage={() => setPickerOpen(true)}
        />
        {images.length > 0 && (
          <PhotosStrip images={images} onChange={setImages} onAdd={() => setPickerOpen(true)} />
        )}

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
          onChange={(e) => {
            setTitle(e.target.value);
            reset();
          }}
          placeholder="Event Name"
          aria-label="Event name"
          className="w-full bg-transparent text-[30px] font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
        />

        <CategorySelect value={category} onChange={setCategory} />

        <WhenCard
          start={start}
          end={end}
          timezone={timezone}
          onStart={setStart}
          onEnd={setEnd}
          onTimezone={setTimezone}
        />

        <WhereWhat
          city={city}
          onCity={setCity}
          location={location}
          onLocationSelect={handleLocation}
          description={description}
          onDescription={(v) => {
            setDescription(v);
            reset();
          }}
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
        {error && (
          <p className="mb-2 rounded-xl bg-destructive/10 px-3.5 py-2 text-center text-[12.5px] font-medium text-destructive">
            {error instanceof ApiError && error.status === 400
              ? error.message
              : "Couldn't create the event — check your connection and try again."}
          </p>
        )}
        <Button
          size="lg"
          onClick={create}
          disabled={pending || !!missing}
          className="h-12 w-full rounded-full bg-foreground text-[15px] font-semibold text-background shadow-[0_12px_24px_-12px_rgba(0,0,0,0.5)] hover:bg-foreground/90 disabled:opacity-60"
        >
          {pending ? "Creating…" : (missing ?? "Create Event")}
        </Button>
      </div>

      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        remaining={MAX_IMAGES - images.length}
        onSelect={(srcs) => setImages((prev) => [...prev, ...srcs].slice(0, MAX_IMAGES))}
      />
    </div>
  );
}

/** Next round hour from now (so the default is never in the past). */
function defaultStart(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return local(d);
}
function defaultEnd(): string {
  const d = new Date(defaultStart());
  d.setHours(d.getHours() + 2);
  return local(d);
}
function local(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
