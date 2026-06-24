import type { Metadata } from "next";

import { CreateEventScreen } from "@/components/create/create-event-screen";
import { AuthGate } from "@/components/auth/auth-gate";

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
      <AuthGate
        tone="dark"
        title="Sign in to create an event"
        description="Hosting an event needs an account so guests know who they're joining."
      >
        <CreateEventScreen />
      </AuthGate>
    </main>
  );
}
