"use client";

// One question/report thread, readable from either side. `role` says who's
// looking (the host in /manage, the guest in /inbox) so "you" is right and the
// reply box speaks as the right party. Reports can't be replied to by the host
// — they're moderation, not conversation — but the guest can add details.

import Link from "next/link";
import { LuFlag, LuMail } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { ReplyForm } from "@/components/inbox/reply-form";
import { eventCode } from "@/lib/events-data";
import { timeAgo } from "@/lib/time-ago";
import { cn } from "@/lib/utils";
import type { EventReport } from "@/lib/api";

export function ThreadCard({
  thread,
  role,
  onReply,
  action,
}: {
  thread: EventReport;
  role: "host" | "guest";
  /** Send a reply as `role`. Omit to make the thread read-only. */
  onReply?: (message: string) => Promise<void>;
  /** Host-side controls (Resolve/Reopen) rendered in the footer. */
  action?: React.ReactNode;
}) {
  const isReport = thread.kind === "report";
  const closed = thread.status === "resolved";
  const opener = role === "guest" ? "You" : thread.from;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border",
        closed && "opacity-70",
      )}
    >
      <div className="flex items-center gap-2">
        {isReport ? (
          <Badge className="gap-1 border-transparent bg-destructive/10 text-destructive">
            <LuFlag className="size-3" aria-hidden /> Report
          </Badge>
        ) : (
          <Badge className="gap-1 border-transparent bg-amber-100 text-amber-800">
            <LuMail className="size-3" aria-hidden /> Question
          </Badge>
        )}
        {closed && <Badge variant="secondary">Resolved</Badge>}
        <Link
          href={`/${eventCode(thread.eventId)}`}
          className="min-w-0 flex-1 truncate text-right text-[11.5px] font-medium text-muted-foreground hover:text-foreground"
        >
          {thread.eventTitle}
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <Bubble who={opener} mine={role === "guest"} at={thread.createdAt}>
          {thread.message}
        </Bubble>
        {thread.replies.map((r) => (
          <Bubble
            key={r.id}
            who={r.author === "host" ? (role === "host" ? "You" : "Host") : opener}
            mine={r.author === role}
            at={r.createdAt}
          >
            {r.message}
          </Bubble>
        ))}
        {isReport && thread.replies.length === 0 && role === "guest" && (
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            Our team reviews every report. You&apos;ll be notified here when it&apos;s resolved.
          </p>
        )}
      </div>

      {onReply && !(isReport && role === "host") && (
        <ReplyForm
          onSubmit={onReply}
          placeholder={role === "host" ? "Reply to the guest…" : "Add a reply…"}
        />
      )}
      {action && <div className="flex justify-end">{action}</div>}
    </article>
  );
}

function Bubble({
  who,
  mine,
  at,
  children,
}: {
  who: string;
  mine: boolean;
  at: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", mine ? "items-end" : "items-start")}>
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug",
          mine ? "bg-foreground text-background" : "bg-muted text-foreground",
        )}
      >
        {children}
      </p>
      <span className="px-1 text-[10.5px] text-muted-foreground">
        {who} · {timeAgo(at)}
      </span>
    </div>
  );
}
