// City seed — PURE DATA. No React or react-icons here: this module is imported
// server-side (the catalog store, the mock discover API) as well as by the
// client. Presentation (icon + tint) lives in `lib/cities-data.ts`.
//
// Every city carries its centre (`lat`/`lng`) and a generous metro-area
// `bbox` ([west, south, east, north]) so the place search can be bounded to
// the city the user picked. `countryCode` is lowercase ISO 3166-1 alpha-2.

import type { CityInfo } from "@/types";

/** Seed data (no counts — the backend computes those from real events). */
export const CITY_DATA: Omit<CityInfo, "eventCount">[] = [
  // — Bolivia: department capitals —
  { slug: "la-paz", name: "La Paz", aliases: ["Nuestra Señora de La Paz"], country: "Bolivia", countryCode: "bo", region: "South America", lat: -16.4897, lng: -68.1193, bbox: [-68.37, -16.74, -67.87, -16.24], tagline: "Peñas, ferias, hikes and rooftop sunsets across the highest city in the world." },
  { slug: "el-alto", name: "El Alto", country: "Bolivia", countryCode: "bo", region: "South America", lat: -16.5047, lng: -68.1633, bbox: [-68.36, -16.7, -67.96, -16.3], tagline: "The Feria 16 de Julio, cholets and the world's highest big city." },
  { slug: "santa-cruz", name: "Santa Cruz", aliases: ["Santa Cruz de la Sierra"], country: "Bolivia", countryCode: "bo", region: "South America", lat: -17.7833, lng: -63.1821, bbox: [-63.48, -18.08, -62.88, -17.48], tagline: "Warm nights, live music and the busiest scene in the lowlands." },
  { slug: "cochabamba", name: "Cochabamba", country: "Bolivia", countryCode: "bo", region: "South America", lat: -17.3895, lng: -66.1568, bbox: [-66.41, -17.64, -65.91, -17.14], tagline: "The food capital — markets, long lunches and festivals." },
  { slug: "sucre", name: "Sucre", aliases: ["Chuquisaca"], country: "Bolivia", countryCode: "bo", region: "South America", lat: -19.0333, lng: -65.2627, bbox: [-65.46, -19.23, -65.06, -18.83], tagline: "The White City — colonial plazas, chocolate and student nightlife." },
  { slug: "oruro", name: "Oruro", country: "Bolivia", countryCode: "bo", region: "South America", lat: -17.9647, lng: -67.1067, bbox: [-67.31, -18.16, -66.91, -17.76], tagline: "Home of the Carnaval — diabladas, mining lore and altiplano skies." },
  { slug: "potosi", name: "Potosí", country: "Bolivia", countryCode: "bo", region: "South America", lat: -19.5836, lng: -65.7531, bbox: [-65.95, -19.78, -65.55, -19.38], tagline: "Colonial streets, silver-mine history and the gateway to the salar." },
  { slug: "tarija", name: "Tarija", country: "Bolivia", countryCode: "bo", region: "South America", lat: -21.5355, lng: -64.7296, bbox: [-64.93, -21.74, -64.53, -21.34], tagline: "Wine valleys, warm evenings and the slow-paced southern vibe." },
  { slug: "trinidad", name: "Trinidad", country: "Bolivia", countryCode: "bo", region: "South America", lat: -14.8333, lng: -64.9, bbox: [-65.1, -15.03, -64.7, -14.63], tagline: "Beni's capital — motorbikes, river plains and lowland fiestas." },
  { slug: "cobija", name: "Cobija", country: "Bolivia", countryCode: "bo", region: "South America", lat: -11.0267, lng: -68.7692, bbox: [-68.92, -11.18, -68.62, -10.88], tagline: "Pando's Amazon frontier — rainforest, rivers and the Brazilian border." },

  // — Bolivia: intermediate cities and towns —
  { slug: "montero", name: "Montero", country: "Bolivia", countryCode: "bo", region: "South America", lat: -17.3389, lng: -63.2556, bbox: [-63.41, -17.49, -63.11, -17.19] },
  { slug: "quillacollo", name: "Quillacollo", country: "Bolivia", countryCode: "bo", region: "South America", lat: -17.3925, lng: -66.2786, bbox: [-66.43, -17.54, -66.13, -17.24] },
  { slug: "sacaba", name: "Sacaba", country: "Bolivia", countryCode: "bo", region: "South America", lat: -17.4042, lng: -66.0408, bbox: [-66.19, -17.55, -65.89, -17.25] },
  { slug: "warnes", name: "Warnes", country: "Bolivia", countryCode: "bo", region: "South America", lat: -17.5167, lng: -63.1667, bbox: [-63.32, -17.67, -63.02, -17.37] },
  { slug: "yacuiba", name: "Yacuiba", country: "Bolivia", countryCode: "bo", region: "South America", lat: -22.0153, lng: -63.6778, bbox: [-63.83, -22.17, -63.53, -21.87] },
  { slug: "riberalta", name: "Riberalta", country: "Bolivia", countryCode: "bo", region: "South America", lat: -11.0064, lng: -66.0656, bbox: [-66.22, -11.16, -65.92, -10.86] },
  { slug: "guayaramerin", name: "Guayaramerín", country: "Bolivia", countryCode: "bo", region: "South America", lat: -10.8236, lng: -65.3611, bbox: [-65.51, -10.97, -65.21, -10.67] },
  { slug: "villazon", name: "Villazón", country: "Bolivia", countryCode: "bo", region: "South America", lat: -22.0867, lng: -65.5942, bbox: [-65.74, -22.24, -65.44, -21.94] },
  { slug: "tupiza", name: "Tupiza", country: "Bolivia", countryCode: "bo", region: "South America", lat: -21.4425, lng: -65.7194, bbox: [-65.87, -21.59, -65.57, -21.29] },
  { slug: "uyuni", name: "Uyuni", country: "Bolivia", countryCode: "bo", region: "South America", lat: -20.4597, lng: -66.825, bbox: [-67.2, -20.7, -66.6, -20.2] },
  { slug: "copacabana", name: "Copacabana", country: "Bolivia", countryCode: "bo", region: "South America", lat: -16.166, lng: -69.0861, bbox: [-69.24, -16.32, -68.94, -16.02] },
  { slug: "coroico", name: "Coroico", country: "Bolivia", countryCode: "bo", region: "South America", lat: -16.19, lng: -67.7286, bbox: [-67.88, -16.34, -67.58, -16.04] },
  { slug: "samaipata", name: "Samaipata", country: "Bolivia", countryCode: "bo", region: "South America", lat: -18.1792, lng: -63.8747, bbox: [-64.02, -18.33, -63.72, -18.03] },
  { slug: "rurrenabaque", name: "Rurrenabaque", country: "Bolivia", countryCode: "bo", region: "South America", lat: -14.4422, lng: -67.5283, bbox: [-67.68, -14.59, -67.38, -14.29] },
  { slug: "camiri", name: "Camiri", country: "Bolivia", countryCode: "bo", region: "South America", lat: -20.0389, lng: -63.5194, bbox: [-63.67, -20.19, -63.37, -19.89] },
  { slug: "villamontes", name: "Villamontes", country: "Bolivia", countryCode: "bo", region: "South America", lat: -21.2619, lng: -63.4694, bbox: [-63.62, -21.41, -63.32, -21.11] },
  { slug: "bermejo", name: "Bermejo", country: "Bolivia", countryCode: "bo", region: "South America", lat: -22.7322, lng: -64.3425, bbox: [-64.49, -22.88, -64.19, -22.58] },
  { slug: "puerto-suarez", name: "Puerto Suárez", country: "Bolivia", countryCode: "bo", region: "South America", lat: -18.95, lng: -57.8, bbox: [-57.95, -19.1, -57.65, -18.8] },
  { slug: "llallagua", name: "Llallagua", country: "Bolivia", countryCode: "bo", region: "South America", lat: -18.4239, lng: -66.5867, bbox: [-66.74, -18.57, -66.44, -18.27] },
  { slug: "caranavi", name: "Caranavi", country: "Bolivia", countryCode: "bo", region: "South America", lat: -15.8361, lng: -67.5675, bbox: [-67.72, -15.99, -67.42, -15.69] },
  { slug: "san-ignacio-de-velasco", name: "San Ignacio de Velasco", country: "Bolivia", countryCode: "bo", region: "South America", lat: -16.3667, lng: -60.95, bbox: [-61.1, -16.52, -60.8, -16.22] },
  { slug: "vallegrande", name: "Vallegrande", country: "Bolivia", countryCode: "bo", region: "South America", lat: -18.4894, lng: -64.1064, bbox: [-64.26, -18.64, -63.96, -18.34] },

  // — Rest of LATAM —
  { slug: "buenos-aires", name: "Buenos Aires", country: "Argentina", countryCode: "ar", region: "South America", lat: -34.6037, lng: -58.3816, bbox: [-58.83, -35.05, -57.93, -34.15], tagline: "Tango nights, art openings and late dinners." },
  { slug: "bogota", name: "Bogotá", country: "Colombia", countryCode: "co", region: "South America", lat: 4.711, lng: -74.0721, bbox: [-74.37, 4.41, -73.77, 5.01], tagline: "Markets, music and mountain escapes." },
  { slug: "medellin", name: "Medellín", country: "Colombia", countryCode: "co", region: "South America", lat: 6.2442, lng: -75.5812, bbox: [-75.83, 5.99, -75.33, 6.49] },
  { slug: "lima", name: "Lima", country: "Peru", countryCode: "pe", region: "South America", lat: -12.0464, lng: -77.0428, bbox: [-77.39, -12.4, -76.69, -11.7] },
  { slug: "santiago", name: "Santiago", country: "Chile", countryCode: "cl", region: "South America", lat: -33.4489, lng: -70.6693, bbox: [-71.02, -33.8, -70.32, -33.1] },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brazil", countryCode: "br", region: "South America", lat: -22.9068, lng: -43.1729, bbox: [-43.57, -23.31, -42.77, -22.51] },
  { slug: "sao-paulo", name: "São Paulo", country: "Brazil", countryCode: "br", region: "South America", lat: -23.5505, lng: -46.6333, bbox: [-47.08, -24.0, -46.18, -23.1] },
  { slug: "montevideo", name: "Montevideo", country: "Uruguay", countryCode: "uy", region: "South America", lat: -34.9011, lng: -56.1645, bbox: [-56.41, -35.15, -55.91, -34.65] },

  // — North America —
  { slug: "mexico-city", name: "Mexico City", country: "Mexico", countryCode: "mx", region: "North America", lat: 19.4326, lng: -99.1332, bbox: [-99.58, 18.98, -98.68, 19.88], tagline: "A nonstop calendar of art, food and music." },
  { slug: "new-york", name: "New York", country: "United States", countryCode: "us", region: "North America", lat: 40.7128, lng: -74.006, bbox: [-74.46, 40.26, -73.56, 41.16] },
  { slug: "toronto", name: "Toronto", country: "Canada", countryCode: "ca", region: "North America", lat: 43.6532, lng: -79.3832, bbox: [-79.73, 43.3, -79.03, 44.0] },

  // — Europe —
  { slug: "madrid", name: "Madrid", country: "Spain", countryCode: "es", region: "Europe", lat: 40.4168, lng: -3.7038, bbox: [-4.0, 40.12, -3.4, 40.72] },
  { slug: "barcelona", name: "Barcelona", country: "Spain", countryCode: "es", region: "Europe", lat: 41.3874, lng: 2.1686, bbox: [1.92, 41.14, 2.42, 41.64] },
  { slug: "lisbon", name: "Lisbon", country: "Portugal", countryCode: "pt", region: "Europe", lat: 38.7223, lng: -9.1393, bbox: [-9.39, 38.47, -8.89, 38.97], tagline: "Miradouros, fado and sunshine by the river." },
  { slug: "berlin", name: "Berlin", country: "Germany", countryCode: "de", region: "Europe", lat: 52.52, lng: 13.405, bbox: [13.11, 52.22, 13.71, 52.82] },
  { slug: "paris", name: "Paris", country: "France", countryCode: "fr", region: "Europe", lat: 48.8566, lng: 2.3522, bbox: [2.05, 48.56, 2.65, 49.16] },
];

/** Case- and accent-insensitive key ("Potosí" → "potosi"). */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Resolve a city by display name or alias, ignoring case and accents —
 * "santa cruz de la sierra", "Potosi" and "Chuquisaca" all resolve.
 */
export function findCityByName(name: string): Omit<CityInfo, "eventCount"> | undefined {
  const key = normalize(name);
  if (!key) return undefined;
  return CITY_DATA.find(
    (c) => normalize(c.name) === key || c.aliases?.some((a) => normalize(a) === key),
  );
}
