"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AygoStar } from "@/components/ui/brand-icons";

/** Full-screen confirmation shown after an event is created. */
export function CreateSuccess({ title, id }: { title: string; id: string }) {
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-svh flex-col items-center justify-center bg-background px-8 text-center lg:max-w-md">
      <span className="grid size-16 place-items-center rounded-full bg-gold-soft text-gold ring-1 ring-gold/30">
        <AygoStar className="size-8" />
      </span>
      <h1 className="mt-5 text-[22px] font-bold tracking-[-0.03em] text-foreground">
        Event created
      </h1>
      <p className="mt-2 max-w-[26ch] text-[13.5px] text-muted-foreground">
        &ldquo;{title}&rdquo; is live. Share the link and watch the guests roll in.
      </p>
      <Button
        size="lg"
        onClick={() => router.push(`/manage/${id}`)}
        className="mt-6 h-12 w-full max-w-xs rounded-full text-[14px] font-semibold"
      >
        Manage event
      </Button>
      <Button
        size="lg"
        variant="ghost"
        onClick={() => router.push("/home")}
        className="mt-2 h-12 w-full max-w-xs rounded-full text-[14px]"
      >
        Done
      </Button>
    </div>
  );
}
