import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";

export type WhatsAppButtonProps = {
  phone: string | undefined;
  text: string;
  /** Visible label. Defaults to "WhatsApp". */
  label?: string;
  /** sm — compact emerald pill (inside rows). md — taller standalone button. */
  size?: "sm" | "md";
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<WhatsAppButtonProps["size"]>, string> = {
  sm: "rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white",
  md: "inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-[13px] font-semibold text-white",
};

/**
 * Anchor that opens WhatsApp with the contact pre-selected (when `phone` is
 * given) and a message body pre-filled. Falls back to the generic chooser
 * when no phone is available.
 */
export function WhatsAppButton({
  phone,
  text,
  label = "WhatsApp",
  size = "sm",
  className,
}: WhatsAppButtonProps) {
  return (
    <a
      href={waLink(phone, text)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(SIZE_CLASSES[size], className)}
    >
      {label}
    </a>
  );
}
