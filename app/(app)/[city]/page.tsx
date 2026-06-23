import { notFound } from "next/navigation";

import { CITIES, findCity } from "@/lib/cities-data";
import { CityScreen } from "@/components/screens/city-screen";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const found = findCity(city);
  return { title: found ? `aygo — ${found.name}` : "aygo" };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ interest?: string }>;
}) {
  const { city } = await params;
  const { interest } = await searchParams;
  if (!findCity(city)) notFound();

  return <CityScreen slug={city} initialInterest={interest} />;
}
