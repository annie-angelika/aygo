"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ThemePicker } from "@/components/settings/theme-picker";
import { NotificationsSettings } from "@/components/settings/notifications-settings";
import { usePreferences } from "@/hooks/use-preferences";
import type { LanguagePref, ThemePref } from "@/types";

const LANGUAGES: { value: LanguagePref; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

/** Preferences tab — appearance, language and notification channels. */
export function PreferencesForm() {
  const { prefs, update, toggleChannel } = usePreferences();

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">Display</h2>
        <ThemePicker
          value={prefs.theme}
          onChange={(theme: ThemePref) => update({ theme })}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[15px] font-semibold text-foreground">Language</h2>
        <Select
          value={prefs.language}
          onValueChange={(v) => update({ language: (v as LanguagePref) })}
        >
          <SelectTrigger className="h-10 w-full rounded-xl bg-card px-3.5 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {LANGUAGES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[15px] font-semibold text-foreground">
          Notifications
        </h2>
        <p className="text-[12.5px] text-muted-foreground">
          Choose how you would like to be notified about updates, invites and
          subscriptions.
        </p>
        <p className="mt-1 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Events You Attend
        </p>
        <NotificationsSettings
          value={prefs.notifications}
          onToggle={toggleChannel}
        />
      </section>
    </div>
  );
}
