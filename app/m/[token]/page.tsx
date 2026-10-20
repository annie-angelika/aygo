// aygo.app/m/<id> — the public traction report behind a link the admin minted.
// Server-rendered from the live database on every request (never cached), so
// what a reader sees is what the database says at that moment. Unknown,
// expired or revoked links are a 404 — nothing hints that a report exists.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LuShieldCheck } from "react-icons/lu";

import { Logo } from "@/components/layout/logo";
import { MetricsReport } from "@/components/metrics/metrics-report";
import { ExportCsvButton } from "@/components/metrics/export-csv-button";
import { getStore } from "@/lib/server/store";
import { metricsReport, shareIsLive } from "@/lib/server/metrics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Traction report",
  robots: { index: false, follow: false },
};

const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

export default async function PublicMetricsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN.test(token)) notFound();
  const share = await getStore().getMetricShare(token);
  if (!shareIsLive(share)) notFound();
  const report = await metricsReport();
  const generated = new Date(report.generatedAt);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 bg-background px-4 pb-16 pt-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-navy px-5 py-6 text-cream lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-col gap-2">
          <Logo tone="dark" />
          <h1 className="text-[22px] font-bold tracking-[-0.03em]">Traction report · {share.label}</h1>
          <p className="text-[12.5px] text-cream/70">
            Live numbers from aygo.app — recomputed when this page loaded,{" "}
            <time dateTime={report.generatedAt}>{generated.toUTCString()}</time>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gold px-3 text-[12px] font-bold text-navy">
            <LuShieldCheck className="size-4" aria-hidden /> Live data
          </span>
          <ExportCsvButton report={report} className="h-8 rounded-full bg-white/10 text-cream ring-0 hover:bg-white/15 hover:text-cream" />
        </div>
      </header>

      <MetricsReport report={report} />

      <footer className="flex flex-col gap-1.5 rounded-2xl bg-card px-4 py-3.5 text-[12px] leading-snug text-muted-foreground ring-1 ring-border">
        <p className="font-semibold text-foreground">How to verify these numbers</p>
        <p>
          This page is served by aygo.app straight from its production database — every number is counted from the
          app&apos;s own records; nothing is typed in. Reload it any time and the counts update; open <code className="rounded bg-muted px-1 text-foreground">/api/metrics/{share.id}</code>{" "}
          for the same report as JSON. Report id {share.id}. The aygo team can revoke this link at any time.
        </p>
      </footer>
    </main>
  );
}
