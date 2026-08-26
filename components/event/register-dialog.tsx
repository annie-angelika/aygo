"use client";

import { useState } from "react";
import {
  LuCalendarDays,
  LuMapPin,
  LuCheck,
  LuLoaderCircle,
  LuMessageCircle,
  LuShieldCheck,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";

import { useRegistrations } from "@/hooks/use-registrations";
import { useMe } from "@/hooks/use-me";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RegisterTicket } from "@/components/event/register-ticket";
import { applyConfigFor } from "@/lib/apply";
import { formatWhatsapp } from "@/lib/payment";
import { initials } from "@/lib/utils";
import type { Identity } from "@/lib/identity";
import { ThemeCover } from "@/components/event/theme-cover";
import type { AygoEvent } from "@/types";

const EYEBROW =
  "text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground";

/**
 * The in-app registration sheet. You apply directly: your profile is already
 * loaded (so the host sees who you are), you skim the host's requirements, and
 * either get an instant spot or send a request that waits on the host's
 * approval. The write happens ON SUBMIT and is awaited — the confirmation only
 * shows once the server has it, so "Request sent" is never a promise. The
 * sheet is controlled by its parent so it stays mounted while your status
 * flips underneath it.
 */
export function RegisterDialog({
  event,
  open,
  onOpenChange,
}: {
  event: AygoEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { apply, join } = useRegistrations();
  // Your details come pre-loaded from the one resolved identity (lib/identity).
  const { me, email } = useMe();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const cfg = applyConfigFor(event);
  const paid = event.price != null && event.price > 0;

  function handleOpenChange(next: boolean) {
    if (busy && !next) return;
    onOpenChange(next);
    // Reset the sheet once it has closed so it reopens clean.
    if (!next) {
      setSubmitted(false);
      setError(null);
      setMessage("");
    }
  }

  async function handleSubmit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (cfg.requiresApproval) await apply(event.id, message.trim() || undefined);
      else await join(event.id);
      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error && e.message ? e.message : "Something went wrong — try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 bg-background p-0">
        {submitted ? (
          <RegisterTicket event={event} cfg={cfg} onDone={() => handleOpenChange(false)} />
        ) : (
          <div className="flex max-h-[80vh] flex-col">
            <div className="px-5 pr-14 pt-7">
              <DialogTitle className="text-[22px] font-bold leading-[1.15] tracking-[-0.03em]">
                {cfg.requiresApproval ? "Request to join" : "Get your spot"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] leading-snug">
                {cfg.requiresApproval
                  ? `${event.host.name} reviews each request before confirming.`
                  : "One tap and you're on the list. No approval needed."}
              </DialogDescription>
            </div>

            <div className="mt-5 flex-1 space-y-5 overflow-y-auto px-5 pb-1">
              <EventRecap event={event} />
              {paid && <TicketCard event={event} />}
              <ApplicantCard me={me} email={email} />
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
              {error ? (
                <p
                  role="alert"
                  className="mb-2.5 rounded-xl bg-destructive/10 px-3 py-2 text-center text-[12.5px] font-medium text-destructive"
                >
                  {error}
                </p>
              ) : (
                cfg.requiresApproval && (
                  <p className="mb-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <LuShieldCheck className="size-3.5" aria-hidden />
                    You&apos;ll be notified once {event.host.name} responds.
                  </p>
                )
              )}
              <Button
                size="lg"
                disabled={busy}
                onClick={() => void handleSubmit()}
                className="h-12 w-full rounded-full text-[14px] font-semibold shadow-[0_12px_24px_-12px_rgba(9,25,53,0.6)]"
              >
                {busy ? (
                  <LuLoaderCircle className="size-4 animate-spin" aria-hidden />
                ) : cfg.requiresApproval ? (
                  "Send request"
                ) : (
                  "Confirm spot"
                )}
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
      {event.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.cover}
          alt=""
          className="size-16 shrink-0 rounded-[16px] object-cover"
        />
      ) : (
        <ThemeCover theme={event.theme} className="size-16 shrink-0 rounded-[16px]" />
      )}
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

/**
 * Paid events: how the ticket is settled. aygo doesn't move money — you pay
 * the host directly through the channel THEY set (WhatsApp and/or a payment
 * link) and they confirm it by hand. Shown exactly as configured, never a
 * generic "at the door" promise.
 */
function TicketCard({ event }: { event: AygoEvent }) {
  const wa = event.payment?.whatsapp;
  const link = event.payment?.link;
  const channel = wa
    ? { Icon: FaWhatsapp, title: "Pay via WhatsApp", detail: `${event.host.name} · ${formatWhatsapp(wa)}` }
    : link
      ? { Icon: LuCheck, title: "Pay with the host's link", detail: `${event.host.name} confirms your payment by hand` }
      : { Icon: LuMessageCircle, title: "Arrange with the host", detail: `Message ${event.host.name} for how to pay` };
  return (
    <div className="flex flex-col gap-2.5">
      <p className={`${EYEBROW} text-gold-deep`}>Ticket · Bs {event.price}</p>
      <div className="flex items-center gap-3 rounded-[18px] bg-card px-3.5 py-3 ring-1 ring-foreground/8">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
          <channel.Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-foreground">{channel.title}</p>
          <p className="truncate text-[11.5px] text-muted-foreground">{channel.detail}</p>
        </div>
      </div>
    </div>
  );
}

/** The already-loaded profile — what the host will see on your request. */
function ApplicantCard({ me, email }: { me: Identity; email: string | null }) {
  const secondary = [email, me.location].filter(Boolean).join(" · ");
  return (
    <div>
      <p className={`mb-2.5 ${EYEBROW}`}>Registering as</p>
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {me.avatar && <AvatarImage src={me.avatar} alt={me.name} />}
          <AvatarFallback className="bg-navy text-[13px] font-semibold text-cream">
            {initials(me.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">
            {me.name}
          </p>
          {secondary && (
            <p className="truncate text-[12px] text-muted-foreground">{secondary}</p>
          )}
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
      <p className={`mb-2 ${EYEBROW}`}>Good to know</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
              <LuCheck className="size-[11px]" strokeWidth={3} aria-hidden />
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
      <label htmlFor="register-message" className={`mb-1.5 block ${EYEBROW}`}>
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
        className="rounded-[14px] bg-card"
      />
    </div>
  );
}
