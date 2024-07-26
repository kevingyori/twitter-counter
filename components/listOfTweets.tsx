"use client";
import { useTweetStore } from "@/lib/store";
import type { LocalTweet } from "@/lib/types";
import { cn, formatTweetName } from "@/lib/utils";
import { X } from "lucide-react";
import { type MouseEvent, memo, useCallback } from "react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

function formatDate(date: string) {
  return new Date(Number(date)).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// function deleteTweet(
//   id: string,
//   tweetId: string,
//   tweets: any,
//   setTweets: any,
//   router: any,
// ) {
//   setTweets(tweets.filter((tweet: any) => tweet.id !== id));

//   localStorage.removeItem(`tweet-${id}`);

//   if (tweetId === id) {
//     if (tweets.length > 1 && tweets[tweets.length - 1].id === id) {
//       router.push(`/${tweets[tweets.length - 2]?.id}`);
//     } else if (tweets.length > 1 && tweets[tweets.length - 1].id !== id) {
//       router.push(
//         `/${tweets[tweets.map((e: any) => e.id).indexOf(id) + 1].id}`,
//       );
//     } else {
//       router.push(`/${randomName()}`);
//     }
//   }

//   toast({
//     description: `${tweets.filter((t: LocalTweet) => t.id === id)[0].displayName} draft was deleted.`,
//     variant: "destructive",
//   });
// }

type TweetCardProps = {
  tweet: LocalTweet;
};

const TweetCard = memo(function TweetCard({ tweet }: TweetCardProps) {
  const currentTweetId = useTweetStore((state) => state.currentTweetId);
  const setCurrentTweetId = useTweetStore((state) => state.setCurrentTweetId);
  const allTweets = useTweetStore((state) => state.allTweets);
  const deleteTweet = useTweetStore((state) => state.deleteTweet);

  const handleDelete = useCallback(
    function handleDelete(e: MouseEvent) {
      e.stopPropagation();
      deleteTweet(tweet.id);
      // setCurrentTweetId(
      //   allTweets.sort(
      //     (a, b) =>
      //       Number.parseInt(b.createdAt) - Number.parseInt(a.createdAt),
      //   )[allTweets.length]?.id,
      // );
      setCurrentTweetId(allTweets[0].id);
      console.log("new active", allTweets[1].id);

      toast({
        description: "Tweet deleted",
        variant: "destructive",
      });
      // deleteTweet(tweet.id as string, tweetId as string, tweets);
    },
    [deleteTweet, tweet.id],
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      key={tweet.id}
      className={cn(
        "rounded-lg border  bg-card text-card-foreground shadow-sm p-5 flex justify-between items-center cursor-pointer",
        tweet.id === currentTweetId ? "border-black" : "",
      )}
      onClick={() => {
        setCurrentTweetId(tweet.id);
      }}
    >
      <div className="flex flex-col w-3/4">
        <div>{truncate(tweet.text || formatTweetName(tweet.id), 100)}</div>
        <div className="text-sm text-gray-500">
          {formatDate(tweet.createdAt)}
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          className="flex-auto"
          variant="destructive"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

function truncate(str: string, n: number) {
  return str.length > n ? `${str.slice(0, n)}...` : str;
}

const ListOfTweets = memo(() => {
  const allTweets = useTweetStore((state) => state.allTweets);

  return (
    <div className="flex flex-col gap-3 md:w-[675px] min-w-full md:min-w-1">
      {allTweets.length > 0 &&
        allTweets
          .sort(
            (a, b) =>
              Number.parseInt(b.createdAt as string) -
              Number.parseInt(a.createdAt as string),
          )
          .map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)}
    </div>
  );
});

export { ListOfTweets };
