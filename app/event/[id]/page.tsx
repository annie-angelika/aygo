import { notFound } from "next/navigation";

import { fetchEvent, fetchEvents } from "@/lib/api/events";
import { EventDetail } from "@/components/screens/event-detail";

export async function generateStaticParams() {
  const all = await fetchEvents();
  return all.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await fetchEvent(id);
  return { title: event ? `aygo — ${event.title}` : "aygo" };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) notFound();

  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-[#f6f4ef]">
      <EventDetail event={event} />
    </main>
  );
}
