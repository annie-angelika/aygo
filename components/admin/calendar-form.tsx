"use client";

// Create/edit sheet for a featured calendar — the curated collections on
// Discover. Artwork is a URL so the operator can swap the placeholder photos
// for real ones.

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
import { Switch } from "@/components/ui/switch";
import { CATEGORIES } from "@/lib/events-data";
import {
  adminUpsertCalendar,
  type AdminCalendarInput,
} from "@/lib/api/admin";
import type { CalendarInfo, Category } from "@/types";

const EMPTY: AdminCalendarInput = {
  name: "",
  description: "",
  logo: "",
  cover: "",
  location: "La Paz",
  category: "Party",
};

export function CalendarForm({
  open,
  onOpenChange,
  calendar,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit; absent → create. */
  calendar?: CalendarInfo | null;
  onSaved: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-4">
        <SheetTitle className="pt-2">
          {calendar ? "Edit calendar" : "New calendar"}
        </SheetTitle>
        {/* The sheet unmounts on close, so the body re-initializes per open. */}
        <FormBody
          calendar={calendar}
          onDone={() => {
            onOpenChange(false);
            onSaved();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

function FormBody({
  calendar,
  onDone,
}: {
  calendar?: CalendarInfo | null;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<AdminCalendarInput>(() => calendar ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<AdminCalendarInput>) =>
    setDraft((d) => ({ ...d, ...patch }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Empty artwork falls back to a stable placeholder, so the card never breaks.
      const seed = draft.name.toLowerCase().replace(/\W+/g, "-");
      await adminUpsertCalendar({
        ...draft,
        logo: draft.logo.trim() || `https://picsum.photos/seed/cal-${seed}/120/120`,
        cover: draft.cover.trim() || `https://picsum.photos/seed/cal-${seed}-cover/480/360`,
      });
      onDone();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't save the calendar.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="no-scrollbar flex flex-col gap-3 overflow-y-auto pb-2 pt-3"
    >
          <Field label="Name">
            <Input
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Andes Outdoors"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Interest">
              <Select
                value={draft.category ?? "Party"}
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
            <Field label="Location">
              <Input
                value={draft.location ?? ""}
                onChange={(e) => set({ location: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Logo URL (empty = auto)">
            <Input
              value={draft.logo}
              onChange={(e) => set({ logo: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Cover URL (empty = auto)">
            <Input
              value={draft.cover}
              onChange={(e) => set({ cover: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              required
            />
          </Field>
          <label className="flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-2.5">
            <span className="text-[12.5px] font-semibold text-foreground">
              Featured badge
            </span>
            <Switch
              checked={Boolean(draft.featured)}
              onCheckedChange={(on) =>
                set({ featured: on ? "Featured calendar" : undefined })
              }
            />
          </label>
          {error && (
            <p className="text-[12px] font-medium text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="h-11 rounded-full text-[14px]"
          >
        {busy ? "Saving…" : calendar ? "Save changes" : "Create calendar"}
      </Button>
    </form>
  );
}
