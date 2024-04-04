"use client";
import { Button } from "./ui/button";
import { Eraser, Pencil, Plus, Save } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocalStorage } from "@uidotdev/usehooks";
import Link from "next/link";
import { randomName } from "@/lib/utils";
import { LocalTweet, LocalTweets } from "./types";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "./ui/use-toast";

function toggleEdit(
  id: string,
  editableTweets: any,
  setEditableTweets: any,
  setNewlyEditableTweet: any,
) {
  if (editableTweets.includes(id)) {
    setEditableTweets(editableTweets.filter((tweet: any) => tweet !== id));
    setNewlyEditableTweet("");
  } else {
    setEditableTweets((e: any) => [...e, id]);
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
    description: "The draft has been deleted.",
    variant: "destructive",
  });
}
function DeleteButton({ handleDelete }: any) {
  return (
    <Button className="flex-auto" variant="destructive" onClick={handleDelete}>
      <Eraser className="h-4 w-4" />
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

function TweetCard({
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
  }, [newlyEditableTweet, findTweetIndex, inputRef]);

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
      {editableTweets.includes(tweet.id as string) ? (
        <input
          className="bg-gray-50 p-2 inline-block w-1/2 rounded-lg"
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
}

export const ListOfTweets = () => {
  const [tweets, setTweets] = useLocalStorage<LocalTweets>("tweets", []);
  const [editableTweets, setEditableTweets] = useState<string[]>([]);
  const [newlyEditableTweet, setNewlyEditableTweet] = useState<string>("");
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 md:w-[675px] min-w-full md:min-w-1">
      <Button onClick={() => router.push(`/${randomName()}`)}>
        <Plus className="mr-2 h-4 w-4" /> New
      </Button>
      {tweets.toReversed().map((tweet) => (
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
};
