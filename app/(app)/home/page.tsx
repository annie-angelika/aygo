import { HomeScreen, type Period } from "@/components/screens/home-screen";
import { AuthGate } from "@/components/auth/auth-gate";

export const metadata = { title: "Tickets" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const value: Period = period === "past" ? "past" : "upcoming";
  return (
    <AuthGate
      title="Sign in to see your tickets"
      description="Your registrations and the events you're going to live here once you sign in."
    >
      <HomeScreen period={value} />
    </AuthGate>
  );
}
