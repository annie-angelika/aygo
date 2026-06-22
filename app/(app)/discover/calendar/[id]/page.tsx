import { notFound } from "next/navigation";

import { FEATURED_CALENDARS, findCalendar } from "@/lib/discover-data";
import { CalendarScreen } from "@/components/screens/calendar-screen";

export function generateStaticParams() {
  return FEATURED_CALENDARS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const calendar = findCalendar(id);
  return { title: calendar ? `aygo — ${calendar.name}` : "aygo" };
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!findCalendar(id)) notFound();

  return <CalendarScreen id={id} />;
}
