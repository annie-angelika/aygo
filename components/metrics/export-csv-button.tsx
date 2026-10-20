"use client";

import { LuDownload } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { reportToCsv } from "@/lib/metrics";
import type { MetricsReport } from "@/types";

/** Downloads the weekly table as CSV, in the traction sheet's column order. */
export function ExportCsvButton({ report, className }: { report: MetricsReport; className?: string }) {
  function download() {
    const blob = new Blob(["﻿" + reportToCsv(report)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aygo-traccion-${report.generatedAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Button variant="outline" size="sm" onClick={download} className={className}>
      <LuDownload className="size-3.5" aria-hidden /> CSV
    </Button>
  );
}
