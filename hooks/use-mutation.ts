"use client";

import { useCallback, useState } from "react";

export type MutationState<TArgs extends unknown[], TResult> = {
  /** Run the mutation. Resolves with the result, or rejects on error. */
  mutate: (...args: TArgs) => Promise<TResult>;
  pending: boolean;
  error: Error | null;
  /** Clear a previous error (e.g. when the user edits and retries). */
  reset: () => void;
};

/**
 * Generic hook for the write side of `@/lib/api` — anything that POSTs/PUTs and
 * needs pending/error state for a button:
 *
 *   const { mutate, pending, error } = useMutation(createEvent);
 *   <button disabled={pending} onClick={() => mutate(draft)}>Create</button>
 *
 * For local-first writes that update localStorage instantly (RSVP, profile,
 * preferences) you usually don't need this — the UI already reflects the change
 * and the backend sync is fire-and-forget. Reach for it when the user must wait
 * on the result (creating an event, an action with no optimistic local state).
 */
export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): MutationState<TArgs, TResult> {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setPending(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setPending(false);
      }
    },
    [fn],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, pending, error, reset };
}
