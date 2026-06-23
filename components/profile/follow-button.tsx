"use client";

import { useState } from "react";
import { LuCheck, LuPlus } from "react-icons/lu";

import { Button } from "@/components/ui/button";

/** Follow / Following toggle for another traveler's profile. */
export function FollowButton({ initial = false }: { initial?: boolean }) {
  const [following, setFollowing] = useState(initial);
  return (
    <Button
      onClick={() => setFollowing((f) => !f)}
      variant={following ? "outline" : "default"}
      aria-label={following ? "Following" : "Follow"}
      className="rounded-full px-0 size-8 sm:size-auto sm:px-4"
    >
      {following ? (
        <>
          <LuCheck className="size-3.5" />
          <span className="hidden sm:inline">Following</span>
        </>
      ) : (
        <>
          <LuPlus className="size-3.5" />
          <span className="hidden sm:inline">Follow</span>
        </>
      )}
    </Button>
  );
}
