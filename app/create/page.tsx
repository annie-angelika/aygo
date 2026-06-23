import type { Metadata } from "next";

import { CreateEventScreen } from "@/components/create/create-event-screen";

export const metadata: Metadata = {
  title: "Create",
};

// Standalone (outside the (app) group) so the create flow owns its full-screen
// dark canvas without the light top bar, mirroring Luma's create page.
export default function CreatePage() {
  return (
    // Full-bleed: the screen paints its own themed background edge-to-edge and
    // centers its own content; the light/dark token mode follows the cover theme.
    <main className="min-h-svh w-full">
      <CreateEventScreen />
    </main>
  );
}
