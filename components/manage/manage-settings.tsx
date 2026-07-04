"use client";

// Registration & details settings for the host's event — edits the same draft
// the create flow produced and re-syncs it (the server re-geocodes if the
// location changed and keeps the share link stable).

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { WhenCard } from "@/components/create/when-card";
import { DeleteEvent } from "@/components/manage/delete-event";
import { createEvent } from "@/lib/api";
import type { EventDraft, Visibility } from "@/lib/create-event";

export function ManageSettings({
  draft,
  onSaved,
}: {
  draft: EventDraft | null;
  onSaved: () => void;
}) {
  if (!draft) {
    return (
      <p className="rounded-2xl bg-card/60 px-4 py-6 text-center text-[12.5px] text-muted-foreground ring-1 ring-border">
        This is a catalog event — it&apos;s managed from the admin dashboard.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      <SettingsForm draft={draft} onSaved={onSaved} />
      <DeleteEvent eventId={draft.id} title={draft.title} />
    </div>
  );
}

function SettingsForm({
  draft: initial,
  onSaved,
}: {
  draft: EventDraft;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<EventDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const set = (patch: Partial<EventDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      // Location changed → drop the old pin so the server re-geocodes.
      const next =
        draft.location === initial.location
          ? draft
          : { ...draft, lat: undefined, lng: undefined };
      await createEvent(next);
      setNote("Saved — your event page is up to date.");
      onSaved();
    } catch {
      setNote("Couldn't save — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <Field label="Title">
        <Input
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          required
        />
      </Field>
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold text-foreground">When</span>
        <WhenCard
          start={draft.startsAt}
          end={draft.endsAt}
          timezone={draft.timezone}
          onStart={(v) => set({ startsAt: v })}
          onEnd={(v) => set({ endsAt: v })}
          onTimezone={(v) => set({ timezone: v })}
        />
      </div>
      <Field label="Location">
        <Input
          value={draft.location}
          onChange={(e) => set({ location: e.target.value })}
          placeholder="Place, City"
        />
      </Field>
      <Field label="Description">
        <Textarea
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={3}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
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
        <Field label="Capacity (empty = unlimited)">
          <Input
            type="number"
            min={1}
            value={draft.capacity ?? ""}
            onChange={(e) =>
              set({
                capacity: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </Field>
      </div>
      <label className="flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-2.5">
        <span className="text-[12.5px] font-semibold text-foreground">
          Require approval to join
        </span>
        <Switch
          checked={draft.requiresApproval}
          onCheckedChange={(on) => set({ requiresApproval: on })}
        />
      </label>
      <Field label="Visibility">
        <Select
          value={draft.visibility}
          onValueChange={(v) => set({ visibility: v as Visibility })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private (link only)</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {note && (
        <p className="text-[12px] font-medium text-foreground/80">{note}</p>
      )}
      <Button type="submit" disabled={busy} className="h-11 rounded-full text-[14px]">
        {busy ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
