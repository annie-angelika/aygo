import { TopBar } from "@/components/layout/top-bar";

// Calm warm backdrop + a single top app bar that owns all navigation (no bottom
// tab bar). Keeping nav at the top mirrors Luma and frees the bottom edge.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[radial-gradient(120%_45%_at_50%_-8%,#fde9cf_0%,transparent_55%),#f6f4ef]">
      <TopBar />
      <main className="mx-auto w-full max-w-md pb-16">{children}</main>
    </div>
  );
}
