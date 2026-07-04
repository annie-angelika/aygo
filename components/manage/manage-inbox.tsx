"use client";

// The host's support inbox: questions and reports people sent about THIS
// event. Same items the admin supervises — here the host handles their own.

import { useState } from "react";
import { LuFlag, LuInbox, LuMail } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { setFeedbackStatus, type ManageData } from "@/lib/api/manage";
import { cn } from "@/lib/utils";

export function ManageInbox({
  data,
  onChanged,
}: {
  data: ManageData;
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (data.feedback.length === 0) {
    return (
      <EmptyState
        icon={LuInbox}
        title="No messages yet"
        subtitle="Questions and reports about your event will land here."
      />
    );
  }

  async function toggle(id: string, status: "open" | "resolved") {
    setBusyId(id);
    try {
      await setFeedbackStatus(data.event.id, id, status);
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {data.feedback.map((f) => (
        <article
          key={f.id}
          className={cn(
            "flex flex-col gap-2 rounded-2xl bg-card p-3.5 ring-1 ring-border",
            f.status === "resolved" && "opacity-60",
          )}
        >
          <div className="flex items-center gap-2">
            {f.kind === "report" ? (
              <Badge className="gap-1 border-transparent bg-destructive/10 text-destructive">
                <LuFlag className="size-3" aria-hidden /> Report
              </Badge>
            ) : (
              <Badge className="gap-1 border-transparent bg-amber-100 text-amber-800">
                <LuMail className="size-3" aria-hidden /> Question
              </Badge>
            )}
            <span className="min-w-0 flex-1 truncate text-right text-[11px] text-muted-foreground">
              {f.from} · {new Date(f.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-[13px] leading-snug text-foreground">{f.message}</p>
          <Button
            size="sm"
            variant={f.status === "open" ? "default" : "outline"}
            className="self-end rounded-full text-[12px]"
            disabled={busyId === f.id}
            onClick={() =>
              void toggle(f.id, f.status === "open" ? "resolved" : "open")
            }
          >
            {f.status === "open" ? "Resolve" : "Reopen"}
          </Button>
        </article>
      ))}
    </div>
  );
}
