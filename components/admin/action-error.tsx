import { LuTriangleAlert } from "react-icons/lu";

/** One-line failure notice under an admin list: what failed, in plain words. */
export function ActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] font-medium text-destructive">
      <LuTriangleAlert className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
