import { memo } from "react";
import { useTweetStore } from "@/lib/store";

export const TweetName = memo(function TweetName() {
  const tweet = useTweetStore((state) => state.currentTweet);

  return <h2 className="text-xl h-7">{tweet?.displayName}</h2>;
});
