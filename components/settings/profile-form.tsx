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
import { USERS, CURRENT_USERNAME } from "@/lib/users-data";
import type { ProfileEdits } from "@/types";

const BIO_MAX = 160;
const randomAvatar = () =>
  `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 8)}/240/240`;

/** "Your Profile" settings form — photo, name, bio, location, social links. */
export function ProfileForm() {
  const base = USERS[CURRENT_USERNAME];
  const { edits, save } = useProfileEdits();

  const merged = useMemo<ProfileEdits>(
    () => ({
      name: edits.name ?? base.name,
      bio: edits.bio ?? base.bio,
      location: edits.location ?? base.location,
      avatar: edits.avatar ?? base.avatar,
      socials: edits.socials ?? base.socials ?? {},
    }),
    [edits, base],
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold text-foreground">Your Profile</h2>

      <AvatarUpload
        src={draft.avatar}
        onChange={() => set({ avatar: randomAvatar() })}
      />

      <div className="flex gap-3">
        <Field label="First Name">
          <Input
            value={first}
            onChange={(e) => setName(e.target.value, last)}
            placeholder="First"
          />
        </Field>
        <Field label="Last Name">
          <Input
            value={last}
            onChange={(e) => setName(first, e.target.value)}
            placeholder="Last"
          />
        </Field>
      </div>

      <Field label="Username">
        <div className="flex items-center rounded-xl ring-1 ring-border">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-l-xl bg-muted text-[13px] text-muted-foreground">
            @
          </span>
          <input
            value={CURRENT_USERNAME}
            readOnly
            aria-label="Username"
            className="h-9 w-full cursor-not-allowed rounded-r-xl bg-background px-3 text-[13px] text-muted-foreground outline-none"
          />
        </div>
      </Field>

      <Field label="Bio">
        <Textarea
          value={draft.bio}
          onChange={(e) => set({ bio: e.target.value.slice(0, BIO_MAX) })}
          placeholder="Share a little about your background and interests."
        />
        <span className="self-end text-[10.5px] text-muted-foreground">
          {draft.bio.length}/{BIO_MAX}
        </span>
      </Field>

      <SocialLinks
        value={draft.socials}
        onChange={(socials) => set({ socials })}
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        {saved && (
          <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600">
            <LuCheck className="size-3.5" /> Saved
          </span>
        )}
        <Button
          type="submit"
          disabled={!draft.name.trim()}
          className="rounded-full"
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
