"use client";

import { LuMessageSquare } from "react-icons/lu";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadCard } from "@/components/inbox/thread-card";
import { useMyThreads } from "@/hooks/use-inbox";
import { replyToMyThread } from "@/lib/api";

/** The guest's threads: questions to hosts and reports, with replies. */
export function ThreadList() {
  const { threads, loading, refetch } = useMyThreads();

  if (loading && threads.length === 0) {
    return (
      <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-28 rounded-[18px]" />
        ))}
      </div>
    );
  }
  if (threads.length === 0) {
    return (
      <EmptyState
        icon={LuMessageSquare}
        title="No messages yet"
        subtitle="Ask a host a question from any event page — the conversation continues here."
      />
    );
  }
  return (
    <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-3">
      {threads.map((t) => (
        <ThreadCard
          key={t.id}
          thread={t}
          role="guest"
          onReply={async (text) => {
            await replyToMyThread(t.id, text);
            refetch();
          }}
        />
      ))}
    </div>
  );
}
