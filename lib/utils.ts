/**
 * Tiny class-name composer. Joins truthy strings with spaces so we can write
 * `cn("base", isActive && "active", overrideClassName)` cleanly. We don't
 * deduplicate Tailwind classes — keep callers from passing conflicting ones
 * by funneling overrides through a dedicated `className` prop, last.
 */
export function cn(
  ...classes: Array<string | undefined | null | false | 0>
): string {
  return classes.filter(Boolean).join(" ");
}
