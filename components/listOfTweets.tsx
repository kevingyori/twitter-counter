"use client";
import { randomName } from "@/lib/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Pencil, Plus, Save, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LocalTweet, LocalTweets } from "./types";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

function formatDate(date: string) {
  return new Date(Number(date)).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toggleEdit(
  id: string,
  editableTweets: string[],
  setEditableTweets: Dispatch<string[]>,
  setNewlyEditableTweet: Dispatch<string>,
) {
  if (editableTweets.includes(id)) {
    setEditableTweets(editableTweets.filter((tweet) => tweet !== id));
    setNewlyEditableTweet("");
  } else {
    setEditableTweets((e: string[]) => [...e, id]);
    setNewlyEditableTweet(id);
  }
}

function deleteTweet(
  id: string,
  tweetId: string,
  tweets: any,
  setTweets: any,
  router: any,
) {
  setTweets(tweets.filter((tweet: any) => tweet.id !== id));

  localStorage.removeItem(`tweet-${id}`);

  if (tweetId === id) {
    if (tweets.length > 1 && tweets[tweets.length - 1].id === id) {
      router.push(`/${tweets[tweets.length - 2]?.id}`);
    } else if (tweets.length > 1 && tweets[tweets.length - 1].id !== id) {
      router.push(
        `/${tweets[tweets.map((e: any) => e.id).indexOf(id) + 1].id}`,
      );
    } else {
      router.push(`/${randomName()}`);
    }
  }

  toast({
    description: `${tweets.filter((t: LocalTweet) => t.id === id)[0].displayName} draft was deleted.`,
    variant: "destructive",
  });
}

function DeleteButton({ handleDelete }: any) {
  return (
    <Button className="flex-auto" variant="destructive" onClick={handleDelete}>
      <X className="h-4 w-4" />
    </Button>
  );
}

type TweetCardProps = {
  tweet: Partial<LocalTweet>;
  editableTweets: string[];
  setEditableTweets: Dispatch<string[]>;
  tweets: LocalTweets;
  setTweets: Dispatch<SetStateAction<LocalTweets>>;
  newlyEditableTweet: string;
  setNewlyEditableTweet: Dispatch<string>;
};

const TweetCard = memo(function TweetCard({
  tweet,
  editableTweets,
  setEditableTweets,
  tweets,
  setTweets,
  newlyEditableTweet,
  setNewlyEditableTweet,
}: TweetCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tweetId = useMemo(() => pathname.split("/").pop(), [pathname]);
  const inputRef = useRef<null | HTMLInputElement>(null);

  const findTweetIndex = useCallback(() => {
    return tweets.findIndex((e) => e.id === newlyEditableTweet);
  }, [tweets, newlyEditableTweet]);

  useEffect(() => {
    if (newlyEditableTweet !== "") {
      const index = findTweetIndex();
      if (index !== -1 && inputRef.current) {
        const input = inputRef.current;
        // @ts-ignore
        input.focus();
      }
    }
  }, [newlyEditableTweet, findTweetIndex]);

  function handleDelete(e: any) {
    e.stopPropagation();
    deleteTweet(
      tweet.id as string,
      tweetId as string,
      tweets,
      setTweets,
      router,
    );
  }

  return (
    <div
      key={tweet.id}
      className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 flex justify-between items-center cursor-pointer"
      onClick={() => router.push(`/${tweet.id}`)}
    >
      <div className="flex flex-col w-1/2">
        {editableTweets.includes(tweet.id as string) ? (
          <input
            className="bg-gray-50 p-2 inline-block rounded-lg"
            // @ts-ignore
            ref={inputRef}
            type="text"
            value={tweet.displayName}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleEdit(
                  tweet.id as string,
                  editableTweets,
                  setEditableTweets,
                  setNewlyEditableTweet,
                );
              }
            }}
            onChange={(e) => {
              setTweets((tweets: LocalTweets) =>
                tweets.map((t) =>
                  t.id === tweet.id ? { ...t, displayName: e.target.value } : t,
                ),
              );
            }}
          />
        ) : (
          <Link
            href={`/${tweet.id}`}
            className={tweet.id === tweetId ? "font-bold" : ""}
          >
            {tweet.displayName}
          </Link>
        )}
        <div className="text-sm text-gray-500">
          {formatDate(tweet.createdAt)}
        </div>
      </div>
      <div className="flex gap-3">
        <DeleteButton handleDelete={handleDelete} />
        <Button
          className="flex-auto"
          variant={
            editableTweets.includes(tweet.id as string)
              ? "secondary"
              : "default"
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(
              tweet.id as string,
              editableTweets,
              setEditableTweets,
              setNewlyEditableTweet,
            );
          }}
        >
          {editableTweets.includes(tweet.id as string) ? (
            <Save className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
});

const ListOfTweets = memo(() => {
  const [tweets, setTweets] = useLocalStorage<LocalTweets>("tweets", []);
  const [editableTweets, setEditableTweets] = useState<string[]>([]);
  const [newlyEditableTweet, setNewlyEditableTweet] = useState<string>("");
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 md:w-[675px] min-w-full md:min-w-1">
      <Button onClick={() => router.push(`/${randomName()}`)}>
        <Plus className="mr-2 h-4 w-4" /> New
      </Button>
      {tweets.length > 0 &&
        tweets
          .sort((a, b) => b?.createdAt - a?.createdAt)
          .map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              editableTweets={editableTweets}
              setEditableTweets={setEditableTweets}
              tweets={tweets}
              setTweets={setTweets}
              newlyEditableTweet={newlyEditableTweet}
              setNewlyEditableTweet={setNewlyEditableTweet}
            />
          ))}
    </div>
  );
});

export { ListOfTweets };
