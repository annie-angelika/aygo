import { Input } from "@/components/ui/input";

/**
 * A text Input with native datalist suggestions: existing values one tap away,
 * free text still allowed. `listId` must be unique per rendered instance.
 */
export function SuggestInput({
  listId,
  options,
  ...props
}: React.ComponentProps<typeof Input> & {
  listId: string;
  options: string[];
}) {
  return (
    <>
      <Input list={listId} {...props} />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}
