"use client";

// One question/report thread, readable from either side. `role` says who's
// looking (the host in /manage, the guest in /inbox) so "you" is right and the
// reply box speaks as the right party. Reports can't be replied to by the host
// — they're moderation, not conversation — but the guest can add details.

import Link from "next/link";
import { LuFlag, LuMail } from "react-icons/lu";

import { ReplyForm } from "@/components/inbox/reply-form";
import { eventCode } from "@/lib/events-data";
import { timeAgo } from "@/lib/time-ago";
import { cn } from "@/lib/utils";
import type { EventReport } from "@/lib/api";

const BADGE =
  "inline-flex h-[22px] items-center gap-1 rounded-full pl-1.5 pr-2 text-[11px] font-bold";

export function ThreadCard({
  thread,
  role,
  onReply,
  action,
  highlighted = false,
}: {
  thread: EventReport;
  role: "host" | "guest";
  /** The thread a notification linked to — ringed in gold. */
  highlighted?: boolean;
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
      id={`thread-${thread.id}`}
      className={cn(
        "flex scroll-mt-20 flex-col gap-3 rounded-[18px] bg-card p-3.5 ring-1 ring-foreground/8",
        closed && "opacity-70",
        highlighted && "ring-2 ring-gold",
      )}
    >
      <div className="flex items-center gap-2">
        {isReport ? (
          <span className={cn(BADGE, "bg-destructive/10 text-destructive")}>
            <LuFlag className="size-3" aria-hidden /> Report
          </span>
        ) : (
          <span className={cn(BADGE, "bg-secondary text-foreground")}>
            <LuMail className="size-3" aria-hidden /> Question
          </span>
        )}
        {closed && (
          <span className={cn(BADGE, "px-2 font-semibold text-muted-foreground ring-1 ring-border")}>
            Resolved
          </span>
        )}
        <Link
          href={`/${eventCode(thread.eventId)}`}
          className="min-w-0 flex-1 truncate text-right text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {thread.eventTitle}
        </Link>
      </div>

      {/* The conversation sits on cream paper: guest on the left, host on the right. */}
      <div className="flex flex-col gap-2 rounded-[14px] bg-background p-2.5">
        <Bubble who={opener} author="guest" at={thread.createdAt}>
          {thread.message}
        </Bubble>
        {thread.replies.map((r) => (
          <Bubble
            key={r.id}
            who={r.author === "host" ? (role === "host" ? "You" : "Host") : opener}
            author={r.author === "host" ? "host" : "guest"}
            at={r.createdAt}
          >
            {r.message}
          </Bubble>
        ))}
        {isReport && thread.replies.length === 0 && role === "guest" && (
          <p className="px-1 text-[11.5px] leading-snug text-muted-foreground">
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
  author,
  at,
  children,
}: {
  who: string;
  author: "guest" | "host";
  at: string;
  children: React.ReactNode;
}) {
  const host = author === "host";
  return (
    <div className={cn("flex flex-col gap-1", host ? "items-end" : "items-start")}>
      <p
        className={cn(
          "max-w-[80%] px-3 py-2.5 text-[13px] leading-snug",
          host
            ? "rounded-[16px_16px_4px_16px] bg-navy text-cream"
            : "rounded-[16px_16px_16px_4px] bg-card text-foreground ring-1 ring-foreground/8",
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
