import type { Metadata } from "next";

import { CreateEventScreen } from "@/components/create/create-event-screen";

export const metadata: Metadata = {
  title: "aygo — Create Event",
};

// Standalone (outside the (app) group) so the create flow owns its full-screen
// dark canvas without the light top bar, mirroring Luma's create page.
export default function CreatePage() {
  return (
    // `dark` here paints the in-tree screen dark from first render; the screen
    // also adds `dark` to <html> on mount so portalled menus/dialogs match.
    <main className="dark mx-auto min-h-svh w-full max-w-md bg-background">
      <CreateEventScreen />
    </main>
  );
}
