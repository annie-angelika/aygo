// Mock travelers for the social-tourism graph. You discover people through the
// events you're interested in (there is no user search by design), follow them,
// and heart the stops on their routes. No messaging.

import { CURRENT_USER } from "@/lib/events-data";
import type { TravelerProfile, Visit } from "@/types";

const pic = (seed: string) => `https://picsum.photos/seed/${seed}/240/240`;
const face = (seed: string) => `https://picsum.photos/seed/${seed}/96/96`;

const visit = (
  id: string,
  place: string,
  city: string,
  seed: string,
  category: Visit["category"],
  rating: number,
  date: string,
  likes: number,
): Visit => ({
  id,
  place,
  city,
  cover: pic(seed),
  category,
  rating,
  date,
  likes,
});

export const CURRENT_USERNAME = CURRENT_USER.username;

/** Keyed by username. The "you" entry reuses the signed-in identity. */
export const USERS: Record<string, TravelerProfile> = {
  [CURRENT_USER.username]: {
    username: CURRENT_USER.username,
    name: CURRENT_USER.name,
    avatar: CURRENT_USER.avatar,
    bio: "Chasing sunsets, street food, and good company across the Andes.",
    location: "La Paz, Bolivia",
    followers: 342,
    following: 188,
    visits: [
      visit("v-killi", "Killi Killi Lookout", "La Paz", "killikilli-sunset", "Outdoors", 5, "Jun 14, 2026", 48),
      visit("v-jazz", "Café Berlín", "La Paz", "jazz-night", "Music", 4, "Jun 14, 2026", 21),
      visit("v-salar", "Salar de Uyuni", "Potosí", "salar-uyuni", "Outdoors", 5, "May 30, 2026", 132),
      visit("v-mercado", "Mercado Rodríguez", "La Paz", "mercado-food", "Food", 4, "May 22, 2026", 17),
    ],
  },
  mara: {
    username: "mara",
    name: "Mara Quispe",
    avatar: face("u-mara"),
    bio: "Hiking the cordillera one summit at a time. Always up for a trail.",
    location: "La Paz, Bolivia",
    followers: 1280,
    following: 204,
    visits: [
      visit("m-muela", "Muela del Diablo", "La Paz", "muela-diablo", "Outdoors", 5, "Jun 6, 2026", 96),
      visit("m-cumbre", "La Cumbre", "La Paz", "downhill-bici", "Sports", 4, "May 18, 2026", 41),
      visit("m-chacaltaya", "Chacaltaya", "La Paz", "chacaltaya", "Outdoors", 5, "May 2, 2026", 158),
    ],
  },
  diego: {
    username: "diego",
    name: "Diego Rocha",
    avatar: face("u-diego"),
    bio: "Live music, peñas, and late-night cumbia. Tag me to your next gig.",
    location: "Cochabamba, Bolivia",
    followers: 540,
    following: 312,
    visits: [
      visit("d-pena", "Peña La Marka", "La Paz", "pena-folk", "Music", 5, "Jun 26, 2026", 33),
      visit("d-prado", "El Prado", "La Paz", "after-prado", "Party", 4, "Jun 12, 2026", 58),
    ],
  },
  sol: {
    username: "sol",
    name: "Sol Medina",
    avatar: face("u-sol"),
    bio: "Ceramics, fairs, and slow Saturdays. Collecting makers, not things.",
    location: "Sucre, Bolivia",
    followers: 870,
    following: 145,
    visits: [
      visit("s-feria", "Miraflores Design Fair", "La Paz", "feria-diseno", "Culture", 5, "Jun 27, 2026", 72),
      visit("s-ceramica", "Andean Pottery Studio", "La Paz", "ceramica-taller", "Culture", 4, "Jun 1, 2026", 29),
      visit("s-libro", "La Paz Book Fair", "La Paz", "feria-libro", "Culture", 4, "Jun 8, 2026", 19),
    ],
  },
  tomas: {
    username: "tomas",
    name: "Tomás Reyes",
    avatar: face("u-tomas"),
    bio: "Food-first traveler. Salteñas, markets, and anything grilled.",
    location: "Santa Cruz, Bolivia",
    followers: 2100,
    following: 98,
    visits: [
      visit("t-saltena", "Mercado Lanza", "La Paz", "saltena-morning", "Food", 5, "Jun 21, 2026", 211),
      visit("t-sunset", "Killi Killi Lookout", "La Paz", "killikilli-sunset", "Outdoors", 5, "Jun 21, 2026", 64),
    ],
  },
  ana: {
    username: "ana",
    name: "Ana Flores",
    avatar: face("u-ana"),
    bio: "Weekend explorer. If there's a viewpoint, I've probably been.",
    location: "La Paz, Bolivia",
    followers: 410,
    following: 367,
    visits: [
      visit("a-sunset", "Killi Killi Lookout", "La Paz", "killikilli-sunset", "Outdoors", 4, "Jun 21, 2026", 12),
      visit("a-jazz", "Café Berlín", "La Paz", "jazz-night", "Music", 5, "Jun 14, 2026", 27),
    ],
  },
};

export function findUser(username: string): TravelerProfile | undefined {
  return USERS[username];
}

/** Travelers you can follow (everyone but you). */
const SOCIAL = Object.values(USERS).filter(
  (u) => u.username !== CURRENT_USERNAME,
);

/**
 * Deterministic set of attendees for an event — the discovery surface. A simple
 * character-sum keeps it stable across renders without runtime randomness.
 */
export function attendeesFor(eventId: string): TravelerProfile[] {
  const hash = [...eventId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const start = hash % SOCIAL.length;
  const count = 3 + (hash % 2); // 3 or 4 people
  return Array.from(
    { length: count },
    (_, i) => SOCIAL[(start + i) % SOCIAL.length],
  );
}
