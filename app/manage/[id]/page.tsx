import type { Metadata } from "next";
import { Suspense } from "react";

import { ManageScreen } from "@/components/screens/manage-screen";
import { AuthGate } from "@/components/auth/auth-gate";

export const metadata: Metadata = {
  title: "Manage event",
  robots: { index: false, follow: false },
};

/** The host's dashboard for one event — full-bleed, no app chrome. */
export default async function ManageEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background">
      {/* useSearchParams (tab deep-links) needs a Suspense boundary to prerender. */}
      <Suspense fallback={null}>
        <AuthGate
          title="Sign in to manage your event"
          description="The host dashboard is only available once you're signed in."
        >
          <ManageScreen eventId={id} />
        </AuthGate>
      </Suspense>
    </main>
  );
}
