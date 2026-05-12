/**
 * Builds a wa.me deep link. wa.me expects digits only (no `+`, no spaces),
 * so we strip everything that isn't a digit. When `phone` is missing we
 * fall back to the generic wa.me/?text=... which prompts the user to pick
 * a contact themselves.
 */
export function waLink(phone: string | undefined, text: string): string {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
