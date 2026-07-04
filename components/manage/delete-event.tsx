"use client";

// The Settings tab's danger zone: permanently delete the event. The server
// enforces ownership; on success the local draft goes too and the host lands
// back home.

import { useRouter } from "next/navigation";
import { LuTrash2 } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteManagedEvent } from "@/lib/api/manage";
import { removeDraft } from "@/lib/create-event";

export function DeleteEvent({
  eventId,
  title,
}: {
  eventId: string;
  title: string;
}) {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-2.5 rounded-2xl bg-destructive/5 p-4 ring-1 ring-destructive/20">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-destructive">
        Danger zone
      </p>
      <p className="text-[12px] leading-snug text-muted-foreground">
        Deleting the event takes down its page, guest list and pending requests
        for everyone. This can&apos;t be undone.
      </p>
      <ConfirmDialog
        title="Delete this event?"
        description={`"${title}" and its guest list will be gone for good. Your guests won't be notified.`}
        confirmLabel="Delete event"
        busyLabel="Deleting…"
        onConfirm={async () => {
          await deleteManagedEvent(eventId);
          removeDraft(eventId);
          router.replace("/home");
        }}
        trigger={
          <Button
            type="button"
            variant="destructive"
            className="h-10 self-start rounded-full px-4 text-[12.5px]"
          >
            <LuTrash2 className="size-4" aria-hidden />
            Delete event
          </Button>
        }
      />
    </section>
  );
}
