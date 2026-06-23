import { TopBar } from "@/components/layout/top-bar";

/**
 * The standard app chrome: a single top app bar over a calm warm backdrop, with
 * content in a phone-width column. Shared by the (app) route group's layout and
 * by the flat /<slug> pages (city / calendar / category) that live at the root
 * alongside the chrome-less immersive screens (events, create).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[radial-gradient(120%_45%_at_50%_-8%,#fde9cf_0%,transparent_55%),#f6f4ef]">
      <TopBar />
      <main className="mx-auto w-full max-w-md pb-16">{children}</main>
    </div>
  );
}
