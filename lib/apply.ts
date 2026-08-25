// Presentation config for the in-app "apply to join" flow (Luma-style).
// Approval-vs-instant comes from the event's REAL `requiresApproval` setting
// (the host picks it when creating/managing the event); the requirement lines
// are copy derived from real event fields (price, interest).

import { CURRENT_USER } from "@/lib/events-data";
import { USERS, CURRENT_USERNAME } from "@/lib/users-data";
import type { AygoEvent, Category } from "@/types";

// One concrete "bring this / know this" line per interest, so the list says
// something specific about the event instead of a single generic reassurance.
const CATEGORY_NOTE: Record<Category, string> = {
  Party: "Bring a photo ID. 18+ only.",
  Music: "Bring a photo ID. 18+ only.",
  Outdoors: "Wear sturdy shoes and bring water.",
  Sports: "Come ready to move, with water and a layer.",
  Food: "Come hungry, and bring a bit of cash for extras.",
  Culture: "Materials are provided. Just bring yourself.",
};

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
  // The host's real setting — never derived or invented.
  const requiresApproval = event.requiresApproval ?? false;

  const requirements: string[] = [];

  // What it costs, up front.
  if (event.price != null && event.price > 0) {
    requirements.push(
      event.payment?.whatsapp || event.payment?.link
        ? `Cover is Bs ${event.price} — you pay ${event.host.name} directly after reserving (WhatsApp or payment link on the next step).`
        : `Cover is Bs ${event.price}, paid to ${event.host.name} at the door.`,
    );
  } else {
    requirements.push("Free to join, no cover.");
  }

  // A practical, interest-specific heads-up (what to bring / who can come).
  requirements.push(CATEGORY_NOTE[event.category]);

  // How your spot is secured.
  requirements.push(
    requiresApproval
      ? "Show up on time so the host can save your spot."
      : "Your spot is held the moment you register.",
  );

  return { requiresApproval, requirements, asksMessage: requiresApproval };
}
