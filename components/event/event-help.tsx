"use client";

import Link from "next/link";
import { LuMail, LuFlag } from "react-icons/lu";

import { categorySlug } from "@/lib/events-data";
import { ActionDialog } from "@/components/event/action-dialog";
import { useAuth } from "@/hooks/use-auth";
import { sendEventFeedback } from "@/lib/api";
import type { AygoEvent } from "@/types";

/**
 * The closing meta under the roster (Luma-style): contact + report actions and
 * the event's interest tag. A question opens a real thread with the host (they
 * answer from /manage, you read it in /inbox); a report goes to the admins and
 * you can follow its status from /inbox too. Signed-out users are asked to sign
 * in first so there's an inbox to reply to.
 */
export function EventHelp({ event }: { event: AygoEvent }) {
  const { isAuthenticated, openLoginModal } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={openLoginModal}
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact the host
          </button>
          <button
            type="button"
            onClick={openLoginModal}
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Report event
          </button>
        </div>
        <CategoryTag event={event} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-col items-start gap-2">
        <ActionDialog
          label="Contact the host"
          icon={<LuMail className="size-5" aria-hidden />}
          title="Contact the host"
          description="Have a question about the event? Send a message and the host can reply to you in aygo."
          placeholder="What's your question for the host?"
          helper={`${event.host.name} gets it in their inbox; their answer shows up in yours.`}
          submitLabel="Send message"
          successTitle="Message sent"
          successBody={`${event.host.name} has your question. You'll get a notification when they reply.`}
          onSubmit={(message) => sendEventFeedback(event.id, "question", message)}
        />
        <ActionDialog
          label="Report event"
          icon={<LuFlag className="size-5" aria-hidden />}
          iconClassName="bg-destructive/10 text-destructive"
          title="Report event"
          description="Tell us why you're reporting this event. Anything you can share really helps."
          placeholder="What's going on with this event?"
          submitLabel="Submit report"
          destructive
          successTitle="Report received"
          successBody="Thanks for flagging it. Our team will review it and you can follow the status from your inbox."
          onSubmit={(message) => sendEventFeedback(event.id, "report", message)}
        />
      </div>
      <CategoryTag event={event} />
    </div>
  );
}

function CategoryTag({ event }: { event: AygoEvent }) {
  return (
    <Link
      href={`/${categorySlug(event.category)}`}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
    >
      <span className="text-muted-foreground/60">#</span>
      {event.category}
    </Link>
  );
}
