import { AppShell } from "@/components/layout/app-shell";

// Calm warm backdrop + a single top app bar that owns all navigation (no bottom
// tab bar). Keeping nav at the top mirrors Luma and frees the bottom edge. The
// chrome itself lives in AppShell so the flat /<slug> pages can reuse it.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
