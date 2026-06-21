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
      className="rounded-full"
    >
      {following ? (
        <>
          <LuCheck className="size-3.5" /> Following
        </>
      ) : (
        <>
          <LuPlus className="size-3.5" /> Follow
        </>
      )}
    </Button>
  );
}
