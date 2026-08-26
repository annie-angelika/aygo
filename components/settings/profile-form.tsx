"use client";

import { useState } from "react";
import { LuCheck } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { SocialLinks } from "@/components/settings/social-links";
import { UsernameField, type UsernameStatus } from "@/components/settings/username-field";
import { useProfileEdits } from "@/hooks/use-profile";
import { useMe } from "@/hooks/use-me";
import { setUsername, ApiError } from "@/lib/api";
import { fileToAvatar } from "@/lib/image";
import { normalizeUsername } from "@/lib/username";
import type { ProfileEdits } from "@/types";

const BIO_MAX = 160;
const LOCATION_MAX = 80;

/**
 * "Your Profile" settings form — photo, name, bio, location, social links.
 * Prefilled from the one resolved identity (lib/identity): your explicit edits
 * win, then the signed-in social identity (Pollar), then the neutral base.
 */
export function ProfileForm() {
  const { save } = useProfileEdits();
  const { me: merged, email } = useMe();

  const [draft, setDraft] = useState(merged);
  const [synced, setSynced] = useState(merged);
  const [saved, setSaved] = useState(false);
  const [handle, setHandle] = useState(merged.username ?? "");
  const [handleStatus, setHandleStatus] = useState<UsernameStatus>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Re-sync when the stored value loads (hydration) or changes elsewhere —
  // the "reset state during render" pattern, not an effect.
  if (synced !== merged) {
    setSynced(merged);
    setDraft(merged);
    setHandle(merged.username ?? "");
  }

  const set = (patch: Partial<ProfileEdits>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  const [first = "", ...rest] = draft.name.trim().split(/\s+/);
  const last = rest.join(" ");
  const setName = (f: string, l: string) =>
    set({ name: [f, l].filter(Boolean).join(" ") });

  const handleChanged = normalizeUsername(handle) !== (merged.username ?? "");
  const handleOk = !handleChanged || handleStatus.kind === "available";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !handleOk) return;
    setBusy(true);
    setError(null);
    try {
      // The handle is unique, so it goes through its own endpoint first; the
      // rest of the profile is local-first and syncs in the background.
      const username = handleChanged ? await setUsername(handle) : merged.username ?? undefined;
      const { username: _current, ...edits } = draft;
      void _current;
      save({ ...edits, name: draft.name.trim(), ...(username ? { username } : null) });
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status < 500 ? err.message : "Couldn't save — try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 lg:max-w-2xl">
      <h2 className="text-[15px] font-semibold text-foreground">Your Profile</h2>

      <AvatarUpload
        src={draft.avatar}
        onSelect={(file) =>
          void fileToAvatar(file)
            .then((avatar) => set({ avatar }))
            .catch(() => {})
        }
      />

      <div className="flex gap-3">
        <Field label="First Name">
          <Input
            value={first}
            onChange={(e) => setName(e.target.value, last)}
            placeholder="First"
            className="h-10 bg-card"
          />
        </Field>
        <Field label="Last Name">
          <Input
            value={last}
            onChange={(e) => setName(first, e.target.value)}
            placeholder="Last"
            className="h-10 bg-card"
          />
        </Field>
      </div>

      <Field label="Username">
        <UsernameField
          value={handle}
          onChange={(v) => {
            setHandle(v);
            setSaved(false);
          }}
          current={merged.username}
          onStatus={setHandleStatus}
        />
      </Field>

      {email && (
        <Field label="Email">
          <Input
            value={email}
            readOnly
            aria-label="Email"
            className="h-10 cursor-not-allowed bg-card text-muted-foreground"
          />
          <span className="text-[10.5px] text-muted-foreground">
            From your sign-in — change it with your login provider.
          </span>
        </Field>
      )}

      <Field label="Bio">
        <Textarea
          value={draft.bio}
          onChange={(e) => set({ bio: e.target.value.slice(0, BIO_MAX) })}
          placeholder="Share a little about your background and interests."
          className="bg-card"
        />
        <span className="self-end text-[10.5px] text-muted-foreground">
          {draft.bio.length}/{BIO_MAX}
        </span>
      </Field>

      <Field label="Location">
        <Input
          value={draft.location}
          onChange={(e) => set({ location: e.target.value.slice(0, LOCATION_MAX) })}
          placeholder="La Paz, Bolivia"
          className="h-10 bg-card"
        />
      </Field>

      <SocialLinks
        value={draft.socials}
        onChange={(socials) => set({ socials })}
      />

      <div className="flex flex-col items-center gap-2 pt-1">
        {error && (
          <p role="alert" className="w-full rounded-xl bg-destructive/10 px-3 py-2 text-center text-[12.5px] font-medium text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={!draft.name.trim() || !handleOk || busy}
          className="h-11 w-full rounded-full text-[14px] font-semibold"
        >
          {busy ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-deep">
            <LuCheck className="size-3.5" aria-hidden /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
