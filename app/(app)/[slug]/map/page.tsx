import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { CityMapScreen } from "@/components/screens/city-map-screen";

/** The map view only exists for cities, at /<city>/map. */
export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = findCity(slug);
  return { title: found ? `aygo — ${found.name} map` : "aygo" };
}

export default async function CityMapPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ interest?: string }>;
}) {
  const { slug } = await params;
  const { interest } = await searchParams;
  if (!findCity(slug)) notFound();

  return <CityMapScreen slug={slug} initialInterest={interest} />;
}
