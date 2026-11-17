import { InboxScreen, type InboxTab } from "@/components/screens/inbox-screen";
import { AuthGate } from "@/components/auth/auth-gate";

export const metadata = { title: "Inbox" };

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; thread?: string }>;
}) {
  const { tab, thread } = await searchParams;
  const value: InboxTab = tab === "messages" ? "messages" : "activity";
  return (
    <AuthGate
      title="Sign in to see your inbox"
      description="Registrations at your events, decisions on your requests and replies from hosts land here."
    >
      <InboxScreen tab={value} thread={thread} />
    </AuthGate>
  );
}
