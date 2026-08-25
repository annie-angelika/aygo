// How a paid event gets paid. aygo doesn't move money (yet): the host tells
// guests where to pay — a WhatsApp number (QR simple / transfer arranged in
// chat) and/or a payment link — and the app makes that one tap away. Shared
// by the create flow (validation hints), the server (hard validation) and the
// event page (deep links).

/** Bolivia; an 8-digit mobile (6x/7x) is assumed to be local. */
const DEFAULT_COUNTRY = "591";

/**
 * Normalize a typed WhatsApp number to international digits ("59171234567"),
 * or null when it can't be one. Accepts "+591 7123-4567", "71234567", etc.
 */
export function normalizeWhatsapp(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 8 && /^[67]/.test(digits)) digits = DEFAULT_COUNTRY + digits;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

/** "59171234567" → "+591 71234567" for display. */
export function formatWhatsapp(digits: string): string {
  return digits.startsWith(DEFAULT_COUNTRY)
    ? `+${DEFAULT_COUNTRY} ${digits.slice(DEFAULT_COUNTRY.length)}`
    : `+${digits}`;
}

/** A wa.me deep link with a prefilled message. */
export function whatsappLink(digits: string, text: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Paid events must tell guests how to pay: at least one channel. */
export function hasPaymentChannel(d: { payWhatsapp?: string | null; payLink?: string | null }): boolean {
  return !!(d.payWhatsapp || d.payLink);
}

/** What a guest says when they open the chat to pay. */
export function payMessage(hostName: string, title: string, price: number): string {
  return `Hi ${hostName}! I reserved a spot for "${title}" on aygo and want to pay the Bs ${price} — how do I send it?`;
}
