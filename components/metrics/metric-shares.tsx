"use client";

// Public links to the live report: create, copy, open, revoke. Anyone with a
// link sees the same numbers the admin sees, recomputed on every visit.

import { useState } from "react";
import { LuCopy, LuCheck, LuExternalLink, LuTrash2, LuLink } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricShareForm } from "@/components/metrics/metric-share-form";
import { useMetricShares } from "@/hooks/use-admin";
import { createMetricShare, revokeMetricShare, type MetricShareLink } from "@/lib/api/admin";

function status(s: MetricShareLink): { label: string; tone: string } {
  if (s.revokedAt) return { label: "Revoked", tone: "bg-muted text-muted-foreground" };
  if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) return { label: "Expired", tone: "bg-muted text-muted-foreground" };
  return { label: "Live", tone: "bg-gold-soft text-gold-deep" };
}

export function MetricShares() {
  const { shares, loading, refetch } = useMetricShares(true);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(s: MetricShareLink) {
    await navigator.clipboard.writeText(s.url);
    setCopied(s.id);
    setTimeout(() => setCopied(null), 1500);
  }
  async function revoke(s: MetricShareLink) {
    if (!window.confirm(`Revoke "${s.label}"? Anyone holding the link loses access immediately.`)) return;
    await revokeMetricShare(s.id);
    refetch();
  }

  return (
    <div className="flex flex-col gap-3">
      <MetricShareForm
        onCreate={async (label, days) => {
          const s = await createMetricShare(label, days);
          refetch();
          await copy(s).catch(() => {});
        }}
      />
      {loading && shares.length === 0 ? (
        <Skeleton className="h-24 rounded-2xl" />
      ) : shares.length === 0 ? (
        <EmptyState icon={LuLink} title="No public links yet" subtitle="Create one and send it to whoever needs the live numbers." />
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
          {shares.map((s, i) => {
            const st = status(s);
            const live = st.label === "Live";
            return (
              <li key={s.id} className={`flex items-center gap-2 px-3.5 py-2.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-[13px] font-semibold text-foreground">
                    {s.label}
                    <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${st.tone}`}>{st.label}</span>
                  </p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {s.url.replace(/^https?:\/\//, "")} · created {new Date(s.createdAt).toLocaleDateString()}
                    {s.expiresAt ? ` · expires ${new Date(s.expiresAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                {live && (
                  <>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Copy link" onClick={() => void copy(s)}>
                      {copied === s.id ? <LuCheck className="size-4" /> : <LuCopy className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Open link" nativeButton={false} render={<a href={s.url} target="_blank" rel="noreferrer" />}>
                      <LuExternalLink className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full text-destructive hover:text-destructive" aria-label="Revoke link" onClick={() => void revoke(s)}>
                      <LuTrash2 className="size-4" />
                    </Button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
