import { SettingsNav } from "@/components/settings/settings-nav";

/** Shared chrome for the settings routes: the tab nav sits above each page. */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pt-8">
      <SettingsNav />
      {children}
    </div>
  );
}
