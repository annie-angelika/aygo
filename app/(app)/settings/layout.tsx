import { SettingsNav } from "@/components/settings/settings-nav";

/** Shared chrome for the settings routes: the tab nav sits above each page. */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <SettingsNav />
      {children}
    </div>
  );
}
