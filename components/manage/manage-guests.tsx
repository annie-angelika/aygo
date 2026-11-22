"use client";

// The host deciding who goes: pending join requests (approve/reject) on top —
// that's the decision queue — then the searchable guest list with remove.

import { useState } from "react";
import { LuCheck, LuSearch, LuUsers, LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { GuestProgress } from "@/components/manage/guest-progress";
import { GuestRow } from "@/components/manage/guest-row";
import {
  decideRequest,
  removeGuest,
  setGuestPaid,
  type ManageData,
} from "@/lib/api/manage";
import { cn } from "@/lib/utils";

export function ManageGuests({
  data,
  onChanged,
}: {
  data: ManageData;
  onChanged: () => void;
}) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const paidEvent = (data.event.price ?? 0) > 0;
  const q = query.trim().toLowerCase();
  const guests = data.going.filter(
    (g) => !q || g.name.toLowerCase().includes(q),
  );

  async function act(fn: () => Promise<void>, id: string) {
    setBusyId(id);
    try {
      await fn();
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <GuestProgress going={data.going.length} checkedIn={data.checkedIn} />

      {data.requests.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            Requests{" "}
            <span className="text-muted-foreground">
              ({data.requests.length})
            </span>
          </h2>
          <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
            {data.requests.map((r, i) => (
              <div key={r.requestId} className={i > 0 ? "border-t border-border" : ""}>
                <GuestRow
                  guest={r}
                  subtitle={r.message || "No note"}
                  action={
                    <div className="flex shrink-0 gap-1.5">
                      <Button
                        size="icon"
                        className="size-8 rounded-full"
                        aria-label={`Approve ${r.name}`}
                        disabled={busyId === r.requestId}
                        onClick={() =>
                          void act(
                            () => decideRequest(data.event.id, r.requestId, true),
                            r.requestId,
                          )
                        }
                      >
                        <LuCheck className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full text-destructive hover:text-destructive"
                        aria-label={`Reject ${r.name}`}
                        disabled={busyId === r.requestId}
                        onClick={() =>
                          void act(
                            () => decideRequest(data.event.id, r.requestId, false),
                            r.requestId,
                          )
                        }
                      >
                        <LuX className="size-4" />
                      </Button>
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Guest list
        </h2>
        <div className="relative">
          <LuSearch
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guests…"
            aria-label="Search guests"
            className="pl-9"
          />
        </div>

        {guests.length === 0 ? (
          <EmptyState
            icon={LuUsers}
            title={q ? "No matches" : "No guests yet"}
            subtitle={
              q
                ? "No guest matches that search."
                : "When people join, they'll show up here."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:rounded-none md:bg-transparent md:ring-0">
            {guests.map((g, i) => (
              <div
                key={g.requestId}
                className={cn(
                  "md:rounded-2xl md:border-t-0 md:bg-card md:ring-1 md:ring-border",
                  i > 0 && "border-t border-border",
                )}
              >
                <GuestRow
                  guest={g}
                  paidControl={
                    // Paid outside the app (WhatsApp, link, cash): the host
                    // says so here, and the guest's spot turns into "going".
                    paidEvent && !g.payment ? (
                      <button
                        type="button"
                        disabled={busyId === g.requestId}
                        aria-pressed={!!g.paidAt}
                        title={g.paidAt ? "Tap to undo" : "Confirm you received their payment"}
                        onClick={() =>
                          void act(
                            () => setGuestPaid(data.event.id, g.requestId, !g.paidAt),
                            g.requestId,
                          )
                        }
                        className={cn(
                          "inline-flex h-[26px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[11.5px] font-bold transition-colors disabled:opacity-50",
                          g.paidAt
                            ? "bg-gold text-navy"
                            : "bg-card text-foreground ring-1 ring-border hover:bg-muted",
                        )}
                      >
                        {g.paidAt && <LuCheck className="size-3" strokeWidth={2.5} aria-hidden />}
                        {g.paidAt ? "Paid" : "Mark paid"}
                      </button>
                    ) : undefined
                  }
                  action={
                    <ConfirmDialog
                      title={`Remove ${g.name}?`}
                      description="They lose their spot and disappear from the guest list. They can always ask to join again."
                      confirmLabel="Remove"
                      busyLabel="Removing…"
                      onConfirm={async () => {
                        await removeGuest(data.event.id, g.requestId);
                        onChanged();
                      }}
                      trigger={
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 shrink-0 rounded-full text-destructive hover:text-destructive"
                          aria-label={`Remove ${g.name}`}
                        >
                          <LuX className="size-4" />
                        </Button>
                      }
                    />
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
