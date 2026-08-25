"use client";

// Create/edit sheet for a catalog event. The server derives everything else
// (day labels, isPast, host avatar) — this form only asks for what an operator
// actually decides.

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { LocationFields } from "@/components/admin/location-fields";
import { DatePopover } from "@/components/create/date-popover";
import { TimePopover } from "@/components/create/time-popover";
import { formatDayPill, formatTimePill } from "@/lib/date-utils";
import { CATEGORIES } from "@/lib/events-data";
import { adminUpsertEvent, type AdminEventInput } from "@/lib/api/admin";
import type { AygoEvent, Category } from "@/types";

const EMPTY: AdminEventInput = {
  title: "",
  category: "Party",
  city: "La Paz",
  place: "",
  startsAt: "",
  price: null,
  blurb: "",
};

function toInput(e: AygoEvent): AdminEventInput {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    city: e.city,
    place: e.place,
    startsAt: e.startsAt.slice(0, 16),
    price: e.price,
    blurb: e.blurb,
    cover: e.cover,
    hostName: e.host.name,
    hostPhone: e.host.phone,
    payWhatsapp: e.payment?.whatsapp,
    payLink: e.payment?.link,
    lat: e.lat,
    lng: e.lng,
  };
}

export function EventForm({
  open,
  onOpenChange,
  event,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit; absent → create. */
  event?: AygoEvent | null;
  onSaved: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-4">
        <SheetTitle className="pt-2">
          {event ? "Edit event" : "New event"}
        </SheetTitle>
        {/* The sheet unmounts on close, so the body re-initializes per open. */}
        <FormBody
          event={event}
          onDone={() => {
            onOpenChange(false);
            onSaved();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

const pickerPill =
  "flex-1 rounded-lg bg-background px-3 py-2 text-left text-[12.5px] font-medium text-foreground ring-1 ring-border outline-none transition-colors hover:bg-muted data-popup-open:ring-2 data-popup-open:ring-ring";

/** "YYYY-MM-DDTHH:mm" split into the app's own date + time popovers. */
function StartsPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [date, time] = value.split("T");
  return (
    <div className="flex gap-1.5">
      <DatePopover
        value={date ?? ""}
        onChange={(d) => onChange(`${d}T${time || "19:00"}`)}
      >
        <button type="button" className={pickerPill}>
          {formatDayPill(date ?? "")}
        </button>
      </DatePopover>
      <TimePopover
        value={time ?? ""}
        onChange={(t) => onChange(`${date ?? ""}T${t}`)}
      >
        <button type="button" className={pickerPill}>
          {formatTimePill(time ?? "")}
        </button>
      </TimePopover>
    </div>
  );
}

function FormBody({
  event,
  onDone,
}: {
  event?: AygoEvent | null;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<AdminEventInput>(() =>
    event ? toInput(event) : EMPTY,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<AdminEventInput>) =>
    setDraft((d) => ({ ...d, ...patch }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminUpsertEvent(draft);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the event.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="no-scrollbar flex flex-col gap-3 overflow-y-auto pb-2 pt-3"
    >
          <Field label="Title">
            <Input
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Sunset at Killi Killi"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Interest">
              <Select
                value={draft.category}
                onValueChange={(v) => set({ category: v as Category })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Starts">
              <StartsPicker
                value={draft.startsAt}
                onChange={(v) => set({ startsAt: v })}
              />
            </Field>
            <Field label="Price (BOB, empty = free)">
              <Input
                type="number"
                min={0}
                value={draft.price ?? ""}
                onChange={(e) =>
                  set({ price: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Host name">
              <Input
                value={draft.hostName ?? ""}
                onChange={(e) => set({ hostName: e.target.value })}
              />
            </Field>
          </div>
          <LocationFields
            city={draft.city}
            place={draft.place}
            lat={draft.lat}
            lng={draft.lng}
            onChange={set}
          />
      <Field label="Host WhatsApp (optional)">
            <Input
              value={draft.hostPhone ?? ""}
              onChange={(e) => set({ hostPhone: e.target.value })}
              placeholder="+591…"
            />
          </Field>
          {draft.price != null && draft.price > 0 && (
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Pay via WhatsApp (required if no link)">
                <Input
                  value={draft.payWhatsapp ?? ""}
                  onChange={(e) => set({ payWhatsapp: e.target.value })}
                  placeholder="+591 71234567"
                />
              </Field>
              <Field label="Payment link (required if no WhatsApp)">
                <Input
                  value={draft.payLink ?? ""}
                  onChange={(e) => set({ payLink: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
            </div>
          )}
          <Field label="Cover image URL (empty = auto)">
            <Input
              value={draft.cover ?? ""}
              onChange={(e) => set({ cover: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={draft.blurb}
              onChange={(e) => set({ blurb: e.target.value })}
              rows={3}
              required
            />
          </Field>
          {error && (
            <p className="text-[12px] font-medium text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="h-11 rounded-full text-[14px]"
          >
            {busy ? "Saving…" : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
