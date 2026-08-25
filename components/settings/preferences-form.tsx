"use client";

import { TasteSettings } from "@/components/settings/taste-settings";

/** Interests tab — the interests and home city behind "For you". */
export function PreferencesForm() {
  return (
    <div className="flex flex-col gap-7 lg:max-w-2xl">
      <TasteSettings />
    </div>
  );
}
