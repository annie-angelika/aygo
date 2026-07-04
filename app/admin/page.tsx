import type { Metadata } from "next";

import { AdminScreen } from "@/components/screens/admin-screen";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** The operator dashboard — full-bleed like an event page, no app chrome. */
export default function AdminPage() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background">
      <AdminScreen />
    </main>
  );
}
