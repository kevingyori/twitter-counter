import { useLocalStorage } from "@uidotdev/usehooks";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import type { LocalTweets } from "./types";

export const TweetName = memo(function TweetName() {
  const [tweets] = useLocalStorage<LocalTweets>("tweets", []);
  const pathname = usePathname();
  const activeTweetId = pathname.split("/").pop();
  const tweetName = useMemo(() => {
    return tweets.filter((tweet) => tweet.id === activeTweetId)[0]?.displayName;
  }, [activeTweetId, tweets]);

  return <h2 className="text-xl h-7">{tweetName}</h2>;
});
