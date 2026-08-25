import { TopBar } from "@/components/layout/top-bar";

/**
 * The standard app chrome: the navy top bar over the brand's cream paper (faint
 * Andean contour lines), with content in a phone-width column. Shared by the
 * (app) route group's layout and by the flat /<slug> pages (city / calendar /
 * category) that live at the root alongside the chrome-less immersive screens
 * (events, create).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-contour">
      <TopBar />
      <main className="mx-auto w-full max-w-md pb-16 lg:max-w-6xl lg:px-4 lg:pb-24">{children}</main>
    </div>
  );
}
