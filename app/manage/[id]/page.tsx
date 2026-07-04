import type { Metadata } from "next";

import { ManageScreen } from "@/components/screens/manage-screen";

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
      <ManageScreen eventId={id} />
    </main>
  );
}
