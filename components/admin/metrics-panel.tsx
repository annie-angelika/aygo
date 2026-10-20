"use client";

// The admin's Metrics tab: the live report, CSV export, and the public links
// that expose the same report.

import { LuRefreshCw, LuTriangleAlert } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricsReport } from "@/components/metrics/metrics-report";
import { MetricShares } from "@/components/metrics/metric-shares";
import { ExportCsvButton } from "@/components/metrics/export-csv-button";
import { useAdminMetrics } from "@/hooks/use-admin";

export function MetricsPanel() {
  const { report, error, refetch } = useAdminMetrics(true);

  if (error && !report) {
    return (
      <p className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] font-medium text-destructive">
        <LuTriangleAlert className="size-4 shrink-0" aria-hidden />
        Couldn&apos;t load the metrics — refresh to try again.
      </p>
    );
  }
  if (!report) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11.5px] text-muted-foreground">
          Computed {new Date(report.generatedAt).toLocaleString()} · week 1 = {report.launchedAt}
        </p>
        <div className="flex items-center gap-1.5">
          <ExportCsvButton report={report} className="rounded-full" />
          <Button variant="ghost" size="sm" className="rounded-full text-[12px]" onClick={refetch} aria-label="Refresh metrics">
            <LuRefreshCw className="size-3.5" aria-hidden /> Refresh
          </Button>
        </div>
      </div>
      <MetricsReport report={report} />
      <section className="flex flex-col gap-2.5">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Public links</h2>
          <p className="text-[12px] leading-snug text-muted-foreground">
            Share the live report without giving anyone admin access. Each link opens aygo.app/m/… with
            these exact numbers, recomputed on every visit, and can be revoked here at any time.
          </p>
        </div>
        <MetricShares />
      </section>
    </div>
  );
}
