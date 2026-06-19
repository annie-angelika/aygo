"use client";

import { usePathname } from "next/navigation";
import { TabBar } from "@/components/layout/tab-bar";

// Each tab gets its own ambient gradient. The route-group layout owns this
// so individual pages can stay focused on content. Home keeps a calm, deep
// violet with two soft glows for depth — no busy patterns.
const GRADIENTS: Record<string, string> = {
  "/home": "bg-[radial-gradient(110%_60%_at_50%_-5%,#3b1d6e_0%,transparent_55%),radial-gradient(90%_55%_at_100%_102%,#2a1457_0%,transparent_62%),linear-gradient(180deg,#1a0f38_0%,#100a26_55%,#0a0718_100%)]",
  "/vibes": "bg-[linear-gradient(180deg,#fde7c2_0%,#fff5e3_30%,#dff1ff_75%,#c5dfff_100%)]",
  "/plan": "bg-[linear-gradient(180deg,#fde7c2_0%,#fff3da_25%,#d8e8ff_70%,#bcd4ff_100%)]",
  "/journal": "bg-[linear-gradient(180deg,#fde7c2_0%,#faeede_25%,#dde9f7_70%,#c4d6ee_100%)]",
  "/profile": "bg-[linear-gradient(180deg,#fde7c2_0%,#fff7e6_25%,#e5f0fb_70%,#d2e1f6_100%)]",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bg = GRADIENTS[pathname] ?? GRADIENTS["/home"];

  return (
    <main className={`min-h-svh w-full ${bg}`}>
      <div className="mx-auto w-full max-w-md pt-6 pb-[120px]">{children}</div>
      <TabBar />
    </main>
  );
}
