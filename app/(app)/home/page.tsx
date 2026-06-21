import { HomeScreen, type Period } from "@/components/screens/home-screen";

export const metadata = { title: "aygo — Your events" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const value: Period = period === "past" ? "past" : "upcoming";
  return <HomeScreen period={value} />;
}
