"use client";

// The host's support inbox: questions and reports people sent about THIS
// event, as threads. Questions can be answered right here (the guest is
// notified and reads it in their inbox); reports are moderation items the
// host can only resolve/reopen.

import { useState } from "react";
import { LuInbox } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ThreadCard } from "@/components/inbox/thread-card";
import {
  setFeedbackStatus,
  replyToFeedback,
  type ManageData,
} from "@/lib/api/manage";

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
        subtitle="Questions from guests about your event will land here — answer them in place."
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
    <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-3">
      {data.feedback.map((f) => (
        <ThreadCard
          key={f.id}
          thread={f}
          role="host"
          onReply={async (text) => {
            await replyToFeedback(data.event.id, f.id, text);
            onChanged();
          }}
          action={
            <Button
              size="sm"
              variant={f.status === "open" ? "default" : "outline"}
              className="rounded-full text-[12px]"
              disabled={busyId === f.id}
              onClick={() =>
                void toggle(f.id, f.status === "open" ? "resolved" : "open")
              }
            >
              {f.status === "open" ? "Mark resolved" : "Reopen"}
            </Button>
          }
        />
      ))}
    </div>
  );
}
