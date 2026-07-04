"use client";

import { useState } from "react";
import {
  LuCalendarDays,
  LuMapPin,
  LuCheck,
  LuClock,
  LuShieldCheck,
} from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { useProfileEdits } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { applyConfigFor, currentApplicant, type Applicant } from "@/lib/apply";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/**
 * The in-app registration sheet — replaces the WhatsApp handoff. You apply
 * directly: your profile is already loaded (so the host sees who you are), you
 * skim the host's requirements, and either get an instant spot or send a request
 * that waits on the host's approval. Visual flow only; the writes are local.
 */
export function RegisterDialog({
  event,
  children,
}: {
  event: AygoEvent;
  children: React.ReactNode;
}) {
  const { apply, join } = useRegistrations();
  const { edits } = useProfileEdits();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const cfg = applyConfigFor(event);
  // Your details come pre-loaded, same precedence as everywhere: explicit
  // profile edits win, then the social login, then the neutral base.
  const base = currentApplicant();
  const me: Applicant = {
    name: edits.name ?? auth.name ?? base.name,
    avatar: edits.avatar ?? auth.avatar ?? base.avatar,
    handle: auth.email ?? base.handle,
    location: edits.location ?? base.location,
  };

  function handleOpenChange(next: boolean) {
    // Commit on close (Done, X, or backdrop) — deferring the write keeps the
    // confirmation on screen, since writing flips the parent out of this sheet.
    if (!next && submitted) {
      if (cfg.requiresApproval) apply(event.id, message.trim() || undefined);
      else join(event.id);
    }
    setOpen(next);
    // Reset the sheet once it has fully closed so it reopens clean.
    if (!next) {
      setSubmitted(false);
      setMessage("");
    }
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* The trigger is the caller's CTA, rendered as the dialog opener. */}
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="gap-0 p-0">
        {submitted ? (
          <SubmittedView event={event} cfg={cfg} onDone={() => setOpen(false)} />
        ) : (
          <div className="flex max-h-[80vh] flex-col">
            <div className="px-5 pt-7">
              <DialogTitle>
                {cfg.requiresApproval ? "Request to join" : "Get your spot"}
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                {cfg.requiresApproval
                  ? `${event.host.name} reviews each request before confirming.`
                  : "One tap and you're on the list. No approval needed."}
              </DialogDescription>
            </div>

            <div className="mt-5 flex-1 space-y-5 overflow-y-auto px-5 pb-1">
              <EventRecap event={event} />
              <ApplicantCard me={me} />
              <Requirements items={cfg.requirements} />
              {cfg.asksMessage && (
                <MessageField
                  host={event.host.name}
                  value={message}
                  onChange={setMessage}
                />
              )}
            </div>

            <div className="px-5 pb-6 pt-5">
              {cfg.requiresApproval && (
                <p className="mb-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <LuShieldCheck className="size-3.5" aria-hidden />
                  You&apos;ll be notified once {event.host.name} responds.
                </p>
              )}
              <Button
                size="lg"
                onClick={handleSubmit}
                className="h-12 w-full rounded-full text-[14px]"
              >
                {cfg.requiresApproval ? "Send request" : "Confirm spot"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** A short recap so you know what you're committing to without scrolling back. */
function EventRecap({ event }: { event: AygoEvent }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={event.cover}
        alt=""
        className="size-16 shrink-0 rounded-2xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-foreground">
          {event.title}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11.5px] text-muted-foreground">
          <LuCalendarDays className="size-3.5 shrink-0" aria-hidden />
          {event.dayLabel} · {event.timeLabel}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
          <LuMapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {event.place}, {event.city}
          </span>
        </p>
      </div>
    </div>
  );
}

/** The already-loaded profile — what the host will see on your request. */
function ApplicantCard({
  me,
}: {
  me: ReturnType<typeof currentApplicant>;
}) {
  return (
    <div>
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        Registering as
      </p>
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={me.avatar} alt={me.name} />
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">
            {me.name}
          </p>
          <p className="truncate text-[12px] text-muted-foreground">
            {me.handle} · {me.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Host's "good to know" list — each line acknowledged just by being read. */
function Requirements({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        Good to know
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <LuCheck className="size-3" aria-hidden />
            </span>
            <span className="text-[12.5px] leading-snug text-foreground/80">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Optional note that rides along with an approval request. */
function MessageField({
  host,
  value,
  onChange,
}: {
  host: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor="register-message"
        className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Note to {host}{" "}
        <span className="font-medium normal-case tracking-normal text-muted-foreground/70">
          (optional)
        </span>
      </label>
      <Textarea
        id="register-message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Tell the host a bit about you…"
      />
    </div>
  );
}

/** Confirmation that stays on screen after you submit, Luma-style. */
function SubmittedView({
  event,
  cfg,
  onDone,
}: {
  event: AygoEvent;
  cfg: ReturnType<typeof applyConfigFor>;
  onDone: () => void;
}) {
  const pending = cfg.requiresApproval;
  return (
    <div className="flex flex-col items-center px-5 py-7 text-center">
      <span
        className={cn(
          "grid size-14 place-items-center rounded-full",
          pending
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700",
        )}
      >
        {pending ? (
          <LuClock className="size-7" aria-hidden />
        ) : (
          <LuCheck className="size-7" aria-hidden />
        )}
      </span>
      <DialogTitle className="mt-4 text-[18px]">
        {pending ? "Request sent" : "You're going!"}
      </DialogTitle>
      <DialogDescription className="mt-1.5 max-w-[18rem] text-[13px]">
        {pending
          ? `${event.host.name} will review your request for "${event.title}". We'll let you know the moment you're approved.`
          : `Your spot for "${event.title}" is saved. See you there!`}
      </DialogDescription>
      <Button
        size="lg"
        onClick={onDone}
        className="mt-5 h-11 w-full rounded-full text-[14px]"
      >
        Done
      </Button>
    </div>
  );
}
