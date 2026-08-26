import { PassportScreen } from "@/components/screens/passport-screen";
import { AuthGate } from "@/components/auth/auth-gate";

export const metadata = { title: "Your collection" };

export default function CollectionPage() {
  return (
    <AuthGate
      title="Sign in to see your collection"
      description="Every aygo you collect at an event is kept here once you sign in."
    >
      <PassportScreen />
    </AuthGate>
  );
}
