"use client";
import { useTweetStore } from "@/lib/store";
import type { LocalTweet } from "@/lib/types";
import { cn, formatTweetName } from "@/lib/utils";
import { type MouseEvent, memo, useCallback } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClipboardCopyIcon,
  DotsHorizontalIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { ToastAction } from "./ui/toast";

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

const TweetCard = memo(function TweetCard({ tweet }: { tweet: LocalTweet }) {
  const currentTweetId = useTweetStore((state) => state.currentTweetId);
  const setCurrentTweetId = useTweetStore((state) => state.setCurrentTweetId);
  const allTweets = useTweetStore((state) => state.allTweets);
  const deleteTweet = useTweetStore((state) => state.deleteTweet);
  const undoDelete = useTweetStore((state) => state.undoDelete);

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
      // console.log("new active", allTweets[1].id);

      toast("Tweet deleted", {
        description: "Tweet deleted",
        action: {
          label: "Undo",
          onClick: () => undoDelete(tweet.id),
        },
      });
    },
    [deleteTweet, tweet.id],
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      key={tweet.id}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex justify-between items-center cursor-pointer",
        tweet.id === currentTweetId ? "border-primary" : "",
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
      {/* <Button
          className="flex-auto"
          variant="destructive"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button> */}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost">
            <DotsHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleDelete}>
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ClipboardCopyIcon className="h-4 w-4 mr-2" /> Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

function truncate(str: string, n: number) {
  return str.length > n ? `${str.slice(0, n)}...` : str;
}

const ListOfTweets = memo(() => {
  const allTweets = useTweetStore((state) => state.allTweets);
  const trash = useTweetStore((state) => state.trash);

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
      {trash.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Trash</h2>
          {trash.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
});

export { ListOfTweets };
