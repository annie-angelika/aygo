"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/top-bar";
import { AudienceRow } from "@/components/create/audience-row";
import { CoverCard } from "@/components/create/cover-card";
import { CreateSuccess } from "@/components/create/create-success";
import { EventOptions } from "@/components/create/event-options";
import type { PriceSettings } from "@/components/create/price-dialog";
import { hasPaymentChannel } from "@/lib/payment";
import { ImagePickerDialog } from "@/components/create/image-picker-dialog";
import { ThemeSheet } from "@/components/create/theme-sheet";
import { WhenCard, whenProblem } from "@/components/create/when-card";
import { WhereWhat } from "@/components/create/where-what";
import { CategorySelect } from "@/components/create/category-select";
import type { LocationMeta } from "@/components/create/location-field";
import { CALENDARS, TIMEZONES, type Visibility } from "@/lib/create-event";
import { CITY_DATA, findCityByName, nearestCity } from "@/lib/cities-data";
import type { Category } from "@/types";
import { DEFAULT_THEME_ID, getTheme } from "@/lib/create-themes";
import { createEvent, ApiError } from "@/lib/api";
import { useMutation } from "@/hooks/use-mutation";
import { cn } from "@/lib/utils";

/**
 * The "Create Event" flow. The whole canvas takes on the selected cover theme's
 * ambient color; the shared top nav stays on top and flips light/dark with the
 * theme's tone (via the `.dark` token toggle), so it always reads against the
 * background. Portalled menus/sheets/popovers inherit it too.
 */
export function CreateEventScreen() {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [images, setImages] = useState<string[]>([]);
  const [coverPosition, setCoverPosition] = useState("50% 50%");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Party");
  const [start, setStart] = useState(() => defaultStart());
  const [end, setEnd] = useState(() => defaultEnd());
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [city, setCity] = useState(CITY_DATA[0].name); // La Paz until we know better
  // Once the host picks a city by hand, the device's position no longer moves it.
  const [cityTouched, setCityTouched] = useState(false);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState("");
  const [pricing, setPricing] = useState<PriceSettings>({ price: null });
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const theme = getTheme(themeId);
  const tone = theme.tone;
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

  // The device's position (shared from the location picker) pre-picks the
  // nearest seeded city, so a host in Cochabamba isn't filing under La Paz.
  function handleNear(coords: { lat: number; lng: number }) {
    if (cityTouched) return;
    const nearby = nearestCity(coords.lat, coords.lng);
    if (nearby) setCity(nearby.name);
  }

  // Reactively match the document's token mode to the active tone. Split from the
  // restore so switching themes never flashes the default in between (the flicker).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", tone === "dark");
  }, [tone]);
  useEffect(() => {
    return () => document.documentElement.classList.remove("dark");
  }, []);

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
      : (whenProblem(start, end) ??
        (pricing.price && pricing.price > 0 && !hasPaymentChannel(pricing)
          ? "Add how guests pay you"
          : null));

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
        // Drafts still carry a calendar id for the validator; there's one calendar.
        calendarId: CALENDARS[0].id,
        visibility,
        category,
        startsAt: start,
        endsAt: end,
        timezone,
        city,
        location: location.trim(),
        ...(coords ? { lat: coords.lat, lng: coords.lng } : null),
        description: description.trim(),
        price: pricing.price,
        ...(pricing.price && pricing.payWhatsapp ? { payWhatsapp: pricing.payWhatsapp } : null),
        ...(pricing.price && pricing.payLink ? { payLink: pricing.payLink } : null),
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

  // The submit block: the fixed bottom bar on phones, inline at the end of the
  // form on desktop. Same button, same handler and disabled state in both.
  const submitBlock = (
    <>
      {error && (
        <p className="mb-2 rounded-xl bg-destructive/10 px-3.5 py-2 text-center text-[12.5px] font-medium text-destructive">
          {error instanceof ApiError && error.status >= 400 && error.status < 500
            ? error.message
            : "Couldn't create the event — check your connection and try again."}
        </p>
      )}
      <Button
        size="lg"
        onClick={create}
        disabled={pending || !!missing}
        className="h-12 w-full rounded-full bg-foreground text-[15px] font-semibold text-background shadow-[0_12px_24px_-12px_rgba(9,25,53,0.6)] hover:bg-foreground/90 disabled:opacity-60"
      >
        {pending ? "Creating…" : (missing ?? "Create Event")}
      </Button>
    </>
  );

  return (
    <div className={cn("min-h-svh overflow-x-hidden pb-32 text-foreground lg:pb-16", theme.page)}>
      <TopBar />

      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-3 lg:grid lg:max-w-6xl lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pt-8">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <CoverCard
            themeId={themeId}
            cover={cover}
            position={coverPosition}
            onPosition={setCoverPosition}
            onPickImage={() => setPickerOpen(true)}
            onRemove={() => setImages([])}
            className="lg:max-w-none"
          />

          <ThemeSheet themeId={themeId} onThemeChange={setThemeId} />

          <AudienceRow
            visibility={visibility}
            onVisibilityChange={setVisibility}
          />
        </div>

        <div className="flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              reset();
            }}
            placeholder="Event Name"
            aria-label="Event name"
            className="w-full bg-transparent text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-foreground outline-none placeholder:text-foreground/35 lg:text-[36px]"
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
            onCity={(v) => {
              setCity(v);
              setCityTouched(true);
            }}
            onNear={handleNear}
            location={location}
            onLocationSelect={handleLocation}
            description={description}
            onDescription={(v) => {
              setDescription(v);
              reset();
            }}
          />

          <EventOptions
            pricing={pricing}
            onPricing={setPricing}
            requiresApproval={requiresApproval}
            onApproval={setRequiresApproval}
            capacity={capacity}
            onCapacity={setCapacity}
          />

          <div className="hidden pt-2 lg:block">{submitBlock}</div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-5 pt-4 lg:hidden">
        {submitBlock}
      </div>

      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(srcs) => setImages(srcs.slice(0, 1))}
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
