"use client";

import { useRouter } from "next/navigation";
import { LuCheck } from "react-icons/lu";

import { Button } from "@/components/ui/button";

/** Full-screen confirmation shown after an event is created. */
export function CreateSuccess({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
        <LuCheck className="size-8" aria-hidden />
      </span>
      <h1 className="mt-5 text-[22px] font-semibold tracking-tight text-foreground">
        Event created
      </h1>
      <p className="mt-2 max-w-[26ch] text-[13.5px] text-muted-foreground">
        &ldquo;{title}&rdquo; is live. Share the link and watch the guests roll in.
      </p>
      <Button
        size="lg"
        onClick={() => router.push("/home")}
        className="mt-6 h-12 w-full max-w-xs rounded-full text-[14px]"
      >
        Done
      </Button>
    </div>
  );
}
