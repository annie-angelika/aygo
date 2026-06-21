// Mock social-tourism profile data. Real ratings/visits come from the backend
// later; this drives the profile UI (bio, follower counts, visited places).

import type { Visit } from "@/types";

const pic = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

export const PROFILE = {
  bio: "Chasing sunsets, street food, and good company across the Andes.",
  location: "La Paz, Bolivia",
  followers: 342,
  following: 188,
};

/** Places this traveler has visited and rated. */
export const VISITS: Visit[] = [
  {
    id: "v-killi",
    place: "Killi Killi Lookout",
    city: "La Paz",
    cover: pic("killikilli-sunset"),
    category: "Outdoors",
    rating: 5,
    date: "Jun 14, 2026",
  },
  {
    id: "v-jazz",
    place: "Café Berlín",
    city: "La Paz",
    cover: pic("jazz-night"),
    category: "Music",
    rating: 4,
    date: "Jun 14, 2026",
  },
  {
    id: "v-libro",
    place: "Campo Ferial",
    city: "La Paz",
    cover: pic("feria-libro"),
    category: "Culture",
    rating: 4,
    date: "Jun 8, 2026",
  },
  {
    id: "v-salar",
    place: "Salar de Uyuni",
    city: "Potosí",
    cover: pic("salar-uyuni"),
    category: "Outdoors",
    rating: 5,
    date: "May 30, 2026",
  },
  {
    id: "v-mercado",
    place: "Mercado Rodríguez",
    city: "La Paz",
    cover: pic("mercado-food"),
    category: "Food",
    rating: 4,
    date: "May 22, 2026",
  },
];
