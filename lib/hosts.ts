// Presentation config for the host(s) of an event. The data model still has a
// single `host`, so co-hosts and the team's stats are derived deterministically
// here. Hosts are drawn from the real traveler pool so each one links to a
// profile. Swap for real host records when the backend lands.

import { USERS, CURRENT_USERNAME } from "@/lib/users-data";
import type { AygoEvent } from "@/types";

export type HostPerson = {
  /** Profile slug — every host is a real traveler you can open and follow. */
  username: string;
  name: string;
  avatar: string;
  /** "Organizer" for the lead host, "Co-host" for the rest. */
  role: "Organizer" | "Co-host";
  /** Only the lead host carries the verified tick, to keep it meaningful. */
  verified: boolean;
};

export type HostInfo = {
  hosts: HostPerson[];
  /** Events this team has hosted before — social proof. */
  eventsHosted: number;
};

// Real travelers (everyone but you) — so a tapped host opens an actual profile.
const POOL = Object.values(USERS).filter((u) => u.username !== CURRENT_USERNAME);

const charSum = (id: string) =>
  id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

export function hostsFor(event: AygoEvent): HostInfo {
  const hash = charSum(event.id);
  // 0–3 co-hosts → 1 to 4 people, all distinct within the pool.
  const total = 1 + (hash % Math.min(4, POOL.length));
  const picks = Array.from(
    { length: total },
    (_, i) => POOL[(hash + i) % POOL.length],
  );

  return {
    hosts: picks.map((u, i) => ({
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      role: i === 0 ? "Organizer" : "Co-host",
      verified: i === 0,
    })),
    eventsHosted: 6 + (hash % 40),
  };
}
