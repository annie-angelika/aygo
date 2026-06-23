import type { Metadata } from "next";

import { CreateEventScreen } from "@/components/create/create-event-screen";

export const metadata: Metadata = {
  title: "aygo — Create Event",
};

// Standalone (outside the (app) group) so the create flow owns its full-screen
// dark canvas without the light top bar, mirroring Luma's create page.
export default function CreatePage() {
  return (
    // The screen paints its own themed background and flips the document's
    // light/dark token mode to match the selected cover theme.
    <main className="mx-auto min-h-svh w-full max-w-md">
      <CreateEventScreen />
    </main>
  );
}
