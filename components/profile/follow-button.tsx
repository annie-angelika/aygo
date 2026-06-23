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
      className="h-9 w-full rounded-full"
    >
      {following ? (
        <>
          <LuCheck className="size-4" />
          Following
        </>
      ) : (
        <>
          <LuPlus className="size-4" />
          Follow
        </>
      )}
    </Button>
  );
}
