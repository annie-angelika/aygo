"use client";

import { useMemo, useState } from "react";
import { LuCheck } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { SocialLinks } from "@/components/settings/social-links";
import { useProfileEdits } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { fileToAvatar } from "@/lib/image";
import { USERS, CURRENT_USERNAME } from "@/lib/users-data";
import type { ProfileEdits } from "@/types";

const BIO_MAX = 160;

/**
 * "Your Profile" settings form — photo, name, bio, location, social links.
 * Prefill precedence matches the rest of the app: your explicit edits win,
 * then the signed-in social identity (Pollar), then the neutral base.
 */
export function ProfileForm() {
  const base = USERS[CURRENT_USERNAME];
  const { edits, save } = useProfileEdits();
  const auth = useAuth();

  const merged = useMemo<ProfileEdits>(
    () => ({
      name: edits.name ?? auth.name ?? base.name,
      bio: edits.bio ?? base.bio,
      location: edits.location ?? base.location,
      avatar: edits.avatar ?? auth.avatar ?? base.avatar,
      socials: edits.socials ?? base.socials ?? {},
    }),
    [edits, auth.name, auth.avatar, base],
  );

  const [draft, setDraft] = useState(merged);
  const [synced, setSynced] = useState(merged);
  const [saved, setSaved] = useState(false);
  // Re-sync when the stored value loads (hydration) or changes elsewhere —
  // the "reset state during render" pattern, not an effect.
  if (synced !== merged) {
    setSynced(merged);
    setDraft(merged);
  }

  const set = (patch: Partial<ProfileEdits>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  const [first = "", ...rest] = draft.name.trim().split(/\s+/);
  const last = rest.join(" ");
  const setName = (f: string, l: string) =>
    set({ name: [f, l].filter(Boolean).join(" ") });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ ...draft, name: draft.name.trim() });
    setSaved(true);
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
        <div className="flex items-center overflow-hidden rounded-xl bg-card ring-1 ring-border">
          <span className="grid h-10 w-10 shrink-0 place-items-center bg-secondary text-[13px] text-muted-foreground">
            @
          </span>
          <input
            value={CURRENT_USERNAME}
            readOnly
            aria-label="Username"
            className="h-10 w-full cursor-not-allowed bg-transparent px-3 text-[13px] text-muted-foreground outline-none"
          />
        </div>
      </Field>

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

      <SocialLinks
        value={draft.socials}
        onChange={(socials) => set({ socials })}
      />

      <div className="flex flex-col items-center gap-2 pt-1">
        <Button
          type="submit"
          disabled={!draft.name.trim()}
          className="h-11 w-full rounded-full text-[14px] font-semibold"
        >
          Save changes
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
