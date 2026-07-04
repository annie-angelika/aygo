"use client";

import Link from "next/link";
import { LuMail, LuFlag } from "react-icons/lu";

import { categorySlug } from "@/lib/events-data";
import { ActionDialog } from "@/components/event/action-dialog";
import { sendEventFeedback } from "@/lib/api";
import type { AygoEvent } from "@/types";

/**
 * The closing meta under the roster (Luma-style): contact + report actions and
 * the event's interest tag. Both actions land in the admin inbox for real.
 */
export function EventHelp({ event }: { event: AygoEvent }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-col items-start gap-2">
        <ActionDialog
          label="Contact the host"
          icon={<LuMail className="size-5" aria-hidden />}
          title="Contact the host"
          description="Have a question about the event? Send a message and the host will get back to you."
          placeholder="What's your question for the host?"
          helper={`The host will reply to you in aygo, ${event.host.name} usually answers within a day.`}
          submitLabel="Send message"
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
          onSubmit={(message) => sendEventFeedback(event.id, "report", message)}
        />
      </div>

      <Link
        href={`/${categorySlug(event.category)}`}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="text-muted-foreground/60">#</span>
        {event.category}
      </Link>
    </div>
  );
}
