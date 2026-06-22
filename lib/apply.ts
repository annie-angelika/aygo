// Presentation config for the in-app "apply to join" flow (Luma-style). This is
// the visual layer only — there is no real host or approval backend yet, so the
// shape of each event's registration (approval vs. instant, what the host wants
// you to know) is derived deterministically from the event itself. Swap this for
// real host settings when the backend lands; the components don't need to change.

import { CURRENT_USER } from "@/lib/events-data";
import { USERS, CURRENT_USERNAME } from "@/lib/users-data";
import type { AygoEvent } from "@/types";

/** The signed-in traveler, the way the host will see them on a request. */
export type Applicant = {
  name: string;
  avatar: string;
  handle: string;
  location: string;
};

export type ApplyConfig = {
  /** Curated event → the host reviews each request before you get a spot. */
  requiresApproval: boolean;
  /** Short, scannable things the host wants you to know before you commit. */
  requirements: string[];
  /** Whether the host asks for a note alongside the request. */
  asksMessage: boolean;
};

// Stable per-id pick so a given event always behaves the same across renders.
const charSum = (id: string) =>
  id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

/** What the host will see — pulled from the already-loaded profile. */
export function currentApplicant(): Applicant {
  const me = USERS[CURRENT_USERNAME];
  return {
    name: me?.name ?? CURRENT_USER.name,
    avatar: me?.avatar ?? CURRENT_USER.avatar,
    handle: `@${CURRENT_USER.username}`,
    location: me?.location ?? "La Paz, Bolivia",
  };
}

export function applyConfigFor(event: AygoEvent): ApplyConfig {
  // Curated events ask for approval; the rest let you in instantly.
  const requiresApproval = charSum(event.id) % 2 === 1;

  const requirements: string[] = [];
  if (event.price != null) {
    requirements.push(`Cover Bs ${event.price} — pay the host at the door.`);
  }
  if (event.category === "Party" || event.category === "Music") {
    requirements.push("18+ — bring a photo ID.");
  }
  requirements.push(
    requiresApproval
      ? "Show up on time so the host can save your spot."
      : "Your spot is held the moment you register.",
  );

  return { requiresApproval, requirements, asksMessage: requiresApproval };
}
