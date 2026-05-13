"use client";

import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

type Budget = UserProfile["budget"];

export type BudgetSelectorProps = {
  value: Budget;
  onChange: (next: Budget) => void;
  /** Rendered above the 3 tiers; suggested amount in BOB. */
  amount?: string;
  amountLabel?: string;
  className?: string;
};

const TIERS: ReadonlyArray<Budget> = ["bajo", "medio", "alto"];

/**
 * Budget tier picker (Bajo / Medio / Alto). Optional amount header echoes
 * the picked tier in money terms so the user has a concrete reference.
 */
export function BudgetSelector({
  value,
  onChange,
  amount,
  amountLabel = "por persona",
  className,
}: BudgetSelectorProps) {
  return (
    <div className={cn(className)}>
      <p className="text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
        Presupuesto
      </p>

      {amount && (
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-[20px] font-semibold text-slate-900">
            {amount}
          </span>
          <span className="text-[11px] text-slate-500">{amountLabel}</span>
        </div>
      )}

      <div className={cn("flex gap-2", amount ? "mt-3" : "mt-2")}>
        {TIERS.map((tier) => {
          const isActive = value === tier;
          return (
            <button
              key={tier}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(tier)}
              className={cn(
                "flex-1 rounded-full py-1.5 text-[12px] font-semibold capitalize transition-colors",
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200",
              )}
            >
              {tier}
            </button>
          );
        })}
      </div>
    </div>
  );
}
