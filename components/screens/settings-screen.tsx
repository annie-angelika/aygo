import { LuSlidersHorizontal, LuCreditCard } from "react-icons/lu";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileForm } from "@/components/settings/profile-form";

/** Settings page with Luma-style underline tabs: Account, Preferences, Payment. */
export function SettingsScreen() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <Tabs defaultValue="account">
        <TabsList variant="line" className="border-b border-border">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-5">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="preferences" className="mt-5">
          <EmptyState
            icon={LuSlidersHorizontal}
            title="Preferences coming soon"
            subtitle="Theme, language, and notifications will live here."
          />
        </TabsContent>

        <TabsContent value="payment" className="mt-5">
          <EmptyState
            icon={LuCreditCard}
            title="No payment methods yet"
            subtitle="Add a card when you start hosting paid events."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
