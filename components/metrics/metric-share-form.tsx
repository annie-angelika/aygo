"use client";

import { useState } from "react";
import { LuLink, LuLoaderCircle } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { ChipGroup } from "@/components/ui/chip-group";
import { Input } from "@/components/ui/input";

type Expiry = "never" | "30" | "90" | "365";

/** Mint a public link: a label (who it's for) and how long it should live. */
export function MetricShareForm({ onCreate }: { onCreate: (label: string, days?: number) => Promise<void> }) {
  const [label, setLabel] = useState("");
  const [expiry, setExpiry] = useState<Expiry>("never");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onCreate(label.trim(), expiry === "never" ? undefined : Number(expiry));
      setLabel("");
    } catch {
      setError("Couldn't create the link — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border">
      <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Who is this link for? (e.g. Investor deck, Oct 2026)" aria-label="Link label" maxLength={80} />
      <ChipGroup<Expiry>
        label="Expires"
        value={expiry}
        onChange={setExpiry}
        options={[
          { value: "never", label: "Never" },
          { value: "30", label: "30 days" },
          { value: "90", label: "90 days" },
          { value: "365", label: "1 year" },
        ]}
      />
      {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}
      <Button type="submit" disabled={!label.trim() || busy} className="h-10 w-fit rounded-full px-4 text-[13px]">
        {busy ? <LuLoaderCircle className="size-4 animate-spin" aria-hidden /> : <LuLink className="size-4" aria-hidden />}
        Create public link
      </Button>
    </form>
  );
}
