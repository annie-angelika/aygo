import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { PreferencesForm } from "@/components/settings/preferences-form";

/** Settings page with Luma-style underline tabs: Account, Preferences. */
export function SettingsScreen() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <Tabs defaultValue="account">
        <TabsList variant="line" className="border-b border-border">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-5">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="preferences" className="mt-5">
          <PreferencesForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
