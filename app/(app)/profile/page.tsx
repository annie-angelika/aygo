import { ProfileScreen } from "@/components/screens/profile-screen";
import { AuthGate } from "@/components/auth/auth-gate";

export const metadata = { title: "Your profile" };

export default function ProfilePage() {
  return (
    <AuthGate
      title="Sign in to see your profile"
      description="Your identity, the events you host and your aygo collection live here once you sign in."
    >
      <ProfileScreen />
    </AuthGate>
  );
}
