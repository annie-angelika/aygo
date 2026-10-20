// The report body shared by the admin tab and the public page: headline
// numbers, the weekly chart, the weekly table. Server-friendly except for the
// chart island.

import { MetricsKpis } from "@/components/metrics/metrics-kpis";
import { MetricsChart } from "@/components/metrics/metrics-chart";
import { MetricsTable } from "@/components/metrics/metrics-table";
import type { MetricsReport as Report } from "@/types";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {hint && <p className="text-[11.5px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function MetricsReport({ report }: { report: Report }) {
  const top = report.totals.categories.slice(0, 4).map((c) => `${c.category} ${c.count}`).join(" · ");
  return (
    <div className="flex flex-col gap-6">
      <Section title="Right now" hint={top ? `Top interests: ${top}` : undefined}>
        <MetricsKpis report={report} />
      </Section>
      <Section title="Growth since launch" hint="Cumulative, per week">
        <div className="rounded-2xl bg-card p-3.5 ring-1 ring-border">
          <MetricsChart weeks={report.weeks} />
        </div>
      </Section>
      <Section title="Week by week" hint={`Counted from the app's records · week 1 starts ${report.launchedAt}`}>
        <MetricsTable weeks={report.weeks} />
      </Section>
    </div>
  );
}
