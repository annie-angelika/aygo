"use client";

// Registration & details settings for the host's event — edits the same draft
// the create flow produced and re-syncs it (the server re-geocodes if the
// location changed and keeps the share link stable). Photos, cover framing and
// price are editable here too.

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
import { WhenCard, whenProblem } from "@/components/create/when-card";
import { CoverCard } from "@/components/create/cover-card";
import { ImagePickerDialog } from "@/components/create/image-picker-dialog";
import { DeleteEvent } from "@/components/manage/delete-event";
import { createEvent, ApiError } from "@/lib/api";
import { type EventDraft, type Visibility } from "@/lib/create-event";
import { hasPaymentChannel, normalizeWhatsapp, formatWhatsapp } from "@/lib/payment";

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
  // Older drafts only have `cover`; treat it as a one-photo gallery.
  const [draft, setDraft] = useState<EventDraft>({
    ...initial,
    // Stored as international digits; show it the way people type it.
    ...(initial.payWhatsapp ? { payWhatsapp: formatWhatsapp(initial.payWhatsapp) } : null),
    images: initial.images ?? (initial.cover ? [initial.cover] : []),
  });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; error?: boolean } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const set = (patch: Partial<EventDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const images = draft.images ?? [];
  const dateProblem = whenProblem(draft.startsAt, draft.endsAt);
  const datesUnchanged =
    draft.startsAt === initial.startsAt && draft.endsAt === initial.endsAt;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const next = { ...draft, cover: images[0] ?? null };
      await createEvent(next);
      setNote({ text: "Saved — your event page is up to date." });
      onSaved();
    } catch (err) {
      setNote({
        text:
          err instanceof ApiError && err.status >= 400 && err.status < 500
            ? err.message
            : "Couldn't save — try again.",
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold text-foreground">Cover</span>
        <CoverCard
          themeId={draft.theme}
          cover={images[0] ?? null}
          position={draft.coverPosition ?? "50% 50%"}
          onPosition={(p) => set({ coverPosition: p })}
          onPickImage={() => setPickerOpen(true)}
          onRemove={() => set({ images: [] })}
        />
      </div>
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
          // A new address means the old pin is wrong: drop it so the server
          // re-geocodes on save (and on any later save too).
          onChange={(e) => set({ location: e.target.value, lat: undefined, lng: undefined })}
          placeholder="Place, City"
          required
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
        <Field label="Price in Bs (empty = free)">
          <Input
            type="number"
            min={0}
            step="0.5"
            inputMode="decimal"
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
      <p className="-mt-1 text-[11px] leading-snug text-muted-foreground">
        Paid events are settled directly with you — in-app payments are coming later.
      </p>
      {draft.price != null && draft.price > 0 && (
        <div className="flex flex-col gap-2.5 rounded-xl bg-muted/40 p-3">
          <p className="text-[12px] font-semibold text-foreground">
            How guests pay you{" "}
            <span className="font-medium text-muted-foreground">(WhatsApp and/or a link)</span>
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="WhatsApp">
              <Input
                type="tel"
                inputMode="tel"
                value={draft.payWhatsapp ?? ""}
                onChange={(e) => set({ payWhatsapp: e.target.value })}
                placeholder="+591 71234567"
              />
            </Field>
            <Field label="Payment link">
              <Input
                type="url"
                inputMode="url"
                value={draft.payLink ?? ""}
                onChange={(e) => set({ payLink: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          </div>
          {!hasPaymentChannel(draft) ? (
            <p className="text-[11.5px] font-medium text-amber-700">
              Add at least one, or guests won&apos;t know how to pay.
            </p>
          ) : draft.payWhatsapp && !normalizeWhatsapp(draft.payWhatsapp) ? (
            <p className="text-[11.5px] font-medium text-amber-700">
              That WhatsApp number doesn&apos;t look right.
            </p>
          ) : null}
        </div>
      )}
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
        <p
          className={
            note.error
              ? "text-[12px] font-medium text-destructive"
              : "text-[12px] font-medium text-foreground/80"
          }
        >
          {note.text}
        </p>
      )}
      <Button
        type="submit"
        disabled={
          busy ||
          (!datesUnchanged && !!dateProblem) ||
          (draft.price != null && draft.price > 0 && !hasPaymentChannel(draft))
        }
        className="h-11 rounded-full text-[14px]"
      >
        {busy ? "Saving…" : "Save changes"}
      </Button>

      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(srcs) => set({ images: srcs.slice(0, 1) })}
      />
    </form>
  );
}
