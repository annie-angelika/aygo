// Single source of truth for domain types. Everything that crosses module
// boundaries (data layer, hooks, components) imports from here.

export type Vibe =
  | "Naturaleza"
  | "Cultura"
  | "Aventura"
  | "Fiestas"
  | "Gastronomía";

export type Destination = {
  id: string;
  name: string;
  region: string;
  tagline: string;
  vibe: Vibe;
  priceFrom: number; // BOB
  accessible: boolean;
  rating: number;
  reviews: number;
  img: string;
  hero: string;
  guide: { name: string; city: string; phone?: string };
};

export type Event = {
  id: string;
  name: string;
  region: string;
  date: string;
  vibe: Vibe;
  img: string;
};

export type Guide = {
  id: string;
  name: string;
  city: string;
  focus: string;
  trips: number;
  rating: number;
  avatar: string;
  phone?: string;
};

export type UserProfile = {
  name: string;
  country: string;
  language: "es" | "en" | "pt";
  age: number | null;
  interests: string[];
  budget: "bajo" | "medio" | "alto";
  tripType: "solo" | "pareja" | "familia" | "grupo";
  accessibility: boolean;
  startDate: string | null; // ISO yyyy-mm-dd
  endDate: string | null;
};

export type TripStatus = "draft" | "confirmed" | "done";

export type Trip = {
  id: string;
  destinationId: string;
  startDate: string | null;
  endDate: string | null;
  budget: UserProfile["budget"];
  status: TripStatus;
  createdAt: string;
};
