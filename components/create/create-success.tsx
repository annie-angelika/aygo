"use client";

import { useRouter } from "next/navigation";
import { LuShare } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { AygoStar } from "@/components/ui/brand-icons";
import { ShareButton } from "@/components/ui/share-button";
import { eventCode } from "@/lib/events-data";

/** Full-screen confirmation shown after an event is created. */
export function CreateSuccess({ title, id }: { title: string; id: string }) {
  const router = useRouter();
  const eventUrl = `/${eventCode(id)}`;
  return (
    <div className="mx-auto flex min-h-svh flex-col items-center justify-center bg-background px-8 text-center lg:max-w-md">
      <span className="grid size-16 place-items-center rounded-full bg-gold-soft text-gold ring-1 ring-gold/30">
        <AygoStar className="size-8" />
      </span>
      <h1 className="mt-5 text-[22px] font-bold tracking-[-0.03em] text-foreground">
        Event created
      </h1>
      <p className="mt-2 max-w-[26ch] text-[13.5px] text-muted-foreground">
        &ldquo;{title}&rdquo; is live.
      </p>
      <ShareButton
        title={title}
        text={`${title} — join me on aygo`}
        url={eventUrl}
        className="mt-6 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-semibold text-background transition-colors hover:bg-foreground/90"
        copiedLabel="Link copied"
      >
        <LuShare className="size-4" aria-hidden />
        Share event
      </ShareButton>
      <Button
        size="lg"
        variant="secondary"
        onClick={() => router.push(`/manage/${id}`)}
        className="mt-2 h-12 w-full max-w-xs rounded-full text-[14px] font-semibold"
      >
        Manage event
      </Button>
      <Button
        size="lg"
        variant="ghost"
        onClick={() => router.push("/discover")}
        className="mt-2 h-12 w-full max-w-xs rounded-full text-[14px]"
      >
        Done
      </Button>
    </div>
  );
}
