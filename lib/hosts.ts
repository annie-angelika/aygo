// Presentation config for the host(s) of an event. Like apply.ts, this is the
// visual layer only: the data model still has a single `host`, so any co-hosts
// and the host's reputation stats are derived deterministically here. Swap for
// real host records when the backend lands; the components don't need to change.

import type { AygoEvent } from "@/types";

export type HostPerson = {
  name: string;
  avatar: string;
  /** "Organizer" for the lead host, "Co-host" for the rest. */
  role: "Organizer" | "Co-host";
  /** Only the lead host carries the verified tick, to keep it meaningful. */
  verified: boolean;
};

export type HostInfo = {
  hosts: HostPerson[];
  /** Human reputation line, e.g. "Usually responds within an hour". */
  responds: string;
  /** Events this team has hosted before — social proof. */
  eventsHosted: number;
};

const face = (seed: string) => `https://picsum.photos/seed/${seed}/96/96`;

// A small pool of plausible co-organizers, picked deterministically per event.
const COHOST_NAMES = [
  "Camila Vargas",
  "Mateo Suárez",
  "Valentina Cruz",
  "Joaquín Méndez",
  "Renata Áñez",
  "Bruno Téllez",
];

const RESPONDS = [
  "Usually responds within an hour",
  "Usually responds within a few hours",
  "Usually responds in a day",
];

const charSum = (id: string) =>
  id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

export function hostsFor(event: AygoEvent): HostInfo {
  const hash = charSum(event.id);
  // 0–4 co-hosts → 1 to 5 people total, so the multi-host case is exercised.
  const cohostCount = hash % 5;

  const cohosts: HostPerson[] = Array.from({ length: cohostCount }, (_, i) => {
    const name = COHOST_NAMES[(hash + i) % COHOST_NAMES.length];
    return {
      name,
      avatar: face(`cohost-${event.id}-${i}`),
      role: "Co-host" as const,
      verified: false,
    };
  });

  return {
    hosts: [
      {
        name: event.host.name,
        avatar: event.host.avatar,
        role: "Organizer",
        verified: true,
      },
      ...cohosts,
    ],
    responds: RESPONDS[hash % RESPONDS.length],
    eventsHosted: 6 + (hash % 40),
  };
}
