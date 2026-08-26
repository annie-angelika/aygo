"use client";

import { useMemo } from "react";

import { useRegistrations } from "@/hooks/use-registrations";
import { useProfileEdits } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { resolveIdentity, type Identity } from "@/lib/identity";

/**
 * The signed-in person: identity (edits ← social login ← fallback, see
 * lib/identity) plus the aygos they've collected. There are no public profiles
 * of other people — attendees are real RSVP rows, hosts are event fields.
 */
export function useMe(): { me: Identity; email: string | null } {
  const { edits } = useProfileEdits();
  const auth = useAuth();
  const me = useMemo(
    () => resolveIdentity(edits, { name: auth.name, avatar: auth.avatar }),
    [edits, auth.name, auth.avatar],
  );
  return { me, email: auth.email };
}

/** `useMe` plus the collection, for the profile and passport screens. */
export function useMyCollection() {
  const { stamps, hydrated } = useRegistrations();
  return { ...useMe(), stamps, hydrated };
}
