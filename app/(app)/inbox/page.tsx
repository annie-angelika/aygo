import { InboxScreen } from "@/components/screens/inbox-screen";
import { AuthGate } from "@/components/auth/auth-gate";

export const metadata = { title: "Inbox" };

export default function InboxPage() {
  return (
    <AuthGate
      title="Sign in to see your inbox"
      description="Registrations at your events, decisions on your requests and replies from hosts land here."
    >
      <InboxScreen />
    </AuthGate>
  );
}
