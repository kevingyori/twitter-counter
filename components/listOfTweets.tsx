"use client";
import { Button } from "./ui/button";
import { Eraser, Pencil, Plus, Save } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocalStorage } from "@uidotdev/usehooks";
import Link from "next/link";
import { randomName } from "@/lib/utils";
import { LocalTweets } from "./types";
import { useEffect, useRef, useState } from "react";

export const ListOfTweets = () => {
  const [tweets, setTweets] = useLocalStorage<LocalTweets>("tweets", []);
  const [editableTweets, setEditableTweets] = useState<string[]>([]);
  const [newlyEditableTweet, setNewlyEditableTweet] = useState<string>("");
  const inputRefs = Array.from({ length: tweets.length }, () => useRef(null));
  const router = useRouter();
  const pathname = usePathname();
  const tweetId = pathname.split("/").pop();

  useEffect(() => {
    if (inputRefs.length > 0 && newlyEditableTweet !== "") {
      inputRefs[
        tweets.map((e) => e.id).indexOf(newlyEditableTweet)
      ].current?.focus();
    }
  }, [editableTweets, inputRefs, newlyEditableTweet, tweets]);

  function deleteTweet(id: string) {
    setTweets(tweets.filter((tweet) => tweet.id !== id));

    localStorage.removeItem(`tweet-${id}`);

    if (tweetId === id) {
      if (tweets.length > 1 && tweets[tweets.length - 1].id === id) {
        router.push(`/editor/${tweets[tweets.length - 2]?.id}`);
      } else if (tweets.length > 1 && tweets[tweets.length - 1].id !== id) {
        router.push(
          `/editor/${tweets[tweets.map((e) => e.id).indexOf(id) + 1].id}`,
        );
      } else {
        router.push(`/editor/${randomName()}`);
      }
    }
  }

  function toggleEdit(id: string) {
    if (editableTweets.includes(id)) {
      setEditableTweets(editableTweets.filter((tweet) => tweet !== id));
      setNewlyEditableTweet("");
    } else {
      setEditableTweets((e) => [...e, id]);
      setNewlyEditableTweet(id);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-[675px]">
      <Button onClick={() => router.push(`/editor/${randomName()}`)}>
        <Plus className="mr-2 h-4 w-4" /> New
      </Button>
      {tweets.toReversed().map((tweet) => (
        <div
          key={tweet.id}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 flex justify-between items-center cursor-pointer"
          onClick={() => router.push(`/editor/${tweet.id}`)}
        >
          {editableTweets.includes(tweet.id as string) ? (
            <input
              className="bg-gray-50 p-2 inline-block w-1/2 rounded-lg"
              ref={inputRefs[tweets.map((e) => e.id).indexOf(tweet.id)]}
              type="text"
              value={tweet.displayName}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  toggleEdit(tweet.id as string);
                }
              }}
              onChange={(e) => {
                setTweets(
                  tweets.map((t) =>
                    t.id === tweet.id
                      ? { ...t, displayName: e.target.value }
                      : t,
                  ),
                );
              }}
            />
          ) : (
            <Link
              href={`/editor/${tweet.id}`}
              className={tweet.id === tweetId ? "font-bold" : ""}
            >
              {tweet.displayName}
            </Link>
          )}
          <div className="flex gap-3">
            <Button
              className="flex-auto"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteTweet(tweet.id as string);
              }}
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              className="flex-auto"
              variant={
                editableTweets.includes(tweet.id as string)
                  ? "secondary"
                  : "default"
              }
              onClick={(e) => {
                e.stopPropagation();
                toggleEdit(tweet.id as string);
                // console.log(ref.current.innerHtml);
                // ref.current.focus();
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
      ))}
    </div>
  );
};
