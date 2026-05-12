import { notFound } from "next/navigation";
import { fetchDestination, fetchDestinations } from "@/lib/api/destinations";
import { PlaceDetail } from "@/components/screens/place-detail";

export async function generateStaticParams() {
  const all = await fetchDestinations();
  return all.map((d) => ({ id: d.id }));
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const destination = await fetchDestination(id);
  if (!destination) notFound();
  return <PlaceDetail destination={destination} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const destination = await fetchDestination(id);
  return {
    title: destination ? `Aygo — ${destination.name}` : "Aygo",
    description: destination?.tagline,
  };
}
