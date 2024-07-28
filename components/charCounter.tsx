"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCharCount } from "@/lib/getCharCount";
import { useTweetStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";

const CharCounter = memo(() => {
  const allTweets = useTweetStore((s) => s.allTweets);
  const currentTweetId = useTweetStore((s) => s.currentTweetId);
  const charCount = useMemo(
    () =>
      getCharCount(allTweets.find((t) => t.id === currentTweetId)?.text || ""),
    [allTweets, currentTweetId],
  );
  const over280 = charCount > 280;

  return (
    <div
      className={cn(
        "text-center md:text-2xl text-xl",
        over280 ? "text-red-400" : "",
      )}
    >
      {charCount}/280 characters
    </div>
  );
});

export default CharCounter;
