"use client";

// Renders nothing on the dev access gate (/dev-access). The root layout's
// account/sync islands would otherwise fire their /api/me/* calls from the
// lock screen and log a 401 for each — the proxy refuses the API until the
// code is entered. Every other route renders its children untouched.

import { usePathname } from "next/navigation";

export function SkipOnGate({ children }: { children: React.ReactNode }) {
  return usePathname() === "/dev-access" ? null : <>{children}</>;
}
