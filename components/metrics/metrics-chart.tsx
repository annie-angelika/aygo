"use client";

// Cumulative users / events / spots per week since launch — one axis, three
// thin lines in a fixed colour order (validated for colour-blind separation on
// the cream surface), a legend, end labels, and a crosshair tooltip on hover.

import { useState } from "react";

import type { MetricWeek } from "@/types";

const SERIES = [
  { key: "users", label: "Users", color: "#3457b2" },
  { key: "events", label: "Events", color: "#a8680a" },
  { key: "rsvps", label: "Spots taken", color: "#1f8a70" },
] as const;

const W = 800;
const H = 200;
const PAD = { l: 36, r: 56, t: 12, b: 26 };
const LABEL_GAP = 13;

/** End labels pushed apart when two series finish within a line-height of each other. */
function spreadLabels(ys: number[]): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++)
    if (order[k].y - order[k - 1].y < LABEL_GAP) order[k].y = order[k - 1].y + LABEL_GAP;
  const out = [...ys];
  for (const o of order) out[o.i] = o.y;
  return out;
}

/** A clean tick step (1, 2, 5 × 10ⁿ) so the axis reads in round numbers. */
function niceStep(max: number): number {
  const raw = Math.max(1, max / 4);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / mag;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * mag;
}

export function MetricsChart({ weeks }: { weeks: MetricWeek[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (weeks.length === 0) return null;

  const max = Math.max(1, ...weeks.flatMap((w) => SERIES.map((s) => w[s.key])));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const x = (i: number) => PAD.l + (weeks.length === 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (weeks.length - 1));
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / top);
  const labelEvery = Math.max(1, Math.ceil(weeks.length / 8));
  const at = hover ?? weeks.length - 1;
  const endLabelY = spreadLabels(SERIES.map((s) => y(weeks[at][s.key])));

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 px-0.5" aria-label="Series">
        {SERIES.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Cumulative users, events and spots taken per week"
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
              <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">
                {t >= 1000 ? `${t / 1000}K` : t}
              </text>
            </g>
          ))}
          {weeks.map((w, i) =>
            i % labelEvery === 0 || i === weeks.length - 1 ? (
              <text key={w.week} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
                W{w.week}
              </text>
            ) : null,
          )}
          {SERIES.map((s) => (
            <polyline
              key={s.key}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={weeks.map((w, i) => `${x(i)},${y(w[s.key])}`).join(" ")}
            />
          ))}
          <line x1={x(at)} x2={x(at)} y1={PAD.t} y2={H - PAD.b} stroke="var(--muted-foreground)" strokeWidth={1} opacity={hover === null ? 0 : 0.5} />
          {SERIES.map((s, k) => (
            <g key={s.key}>
              <circle cx={x(at)} cy={y(weeks[at][s.key])} r={6} fill="var(--background)" />
              <circle cx={x(at)} cy={y(weeks[at][s.key])} r={4} fill={s.color} />
              {hover === null && (
                <>
                  <circle cx={W - PAD.r + 10} cy={endLabelY[k]} r={3} fill={s.color} />
                  <text x={W - PAD.r + 17} y={endLabelY[k] + 3.5} fontSize={11} fontWeight={600} fill="var(--foreground)">
                    {weeks[at][s.key].toLocaleString()}
                  </text>
                </>
              )}
            </g>
          ))}
          {weeks.map((w, i) => (
            <rect
              key={w.week}
              x={x(i) - (W - PAD.l - PAD.r) / (2 * Math.max(1, weeks.length - 1))}
              y={PAD.t}
              width={(W - PAD.l - PAD.r) / Math.max(1, weeks.length - 1)}
              height={H - PAD.t - PAD.b}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
            />
          ))}
        </svg>
        {hover !== null && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-1 rounded-xl bg-card px-3 py-2 text-[11.5px] shadow-[0_18px_40px_-18px_rgba(9,25,53,0.35)] ring-1 ring-border"
            style={{ left: `${(x(hover) / W) * 100}%`, transform: hover > weeks.length / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)" }}
          >
            <p className="font-semibold text-foreground">
              Week {weeks[hover].week} · {weeks[hover].start}
              {weeks[hover].current ? " · in progress" : ""}
            </p>
            {SERIES.map((s) => (
              <p key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: s.color }} aria-hidden />
                {s.label}: <span className="font-semibold tabular-nums text-foreground">{weeks[hover][s.key].toLocaleString()}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
