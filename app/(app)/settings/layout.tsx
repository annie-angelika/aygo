import { AuthGate } from "@/components/auth/auth-gate";
import { SettingsNav } from "@/components/settings/settings-nav";

/**
 * Shared chrome for the settings routes: the tab nav sits above each page.
 * Settings are an account's — signed out, every settings route shows the
 * sign-in prompt instead of an editable (and unsaveable) profile form.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate
      title="Sign in to manage your account"
      description="Your profile, interests and home city live here once you sign in."
    >
      <div className="flex flex-col gap-5 px-4 pt-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pt-8">
        <SettingsNav />
        {children}
      </div>
    </AuthGate>
  );
}
