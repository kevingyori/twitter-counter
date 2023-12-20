"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Eraser, Pencil, Plus } from "lucide-react";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@uidotdev/usehooks";

function randomName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });
}

export const ListOfTweets = () => {
  const [tweets, setTweets] = useLocalStorage("tweets", []);
  const router = useRouter();

  function deleteTweet(name: string) {
    // const tweets = JSON.parse(localStorage.getItem("tweets") ?? "[]");
    setTweets(tweets.filter((tweet: string) => tweet !== name));
    // localStorage.setItem("tweets", JSON.stringify(tweets));

    localStorage.removeItem(`tweet-${name}`);
  }

  return (
    <div className="flex flex-col gap-3 h-56 w-[675px]">
      <Button onClick={() => router.push(`/editor/${randomName()}`)}>
        <Plus className="mr-2 h-4 w-4" /> New
      </Button>
      {tweets.map((tweet: string) => (
        <div
          key={tweet}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 flex justify-between items-center"
        >
          <a href={`/editor/${tweet}`}>{tweet}</a>
          <div className="flex gap-3">
            <Button
              className="flex-auto"
              variant="destructive"
              onClick={() => deleteTweet(tweet)}
            >
              <Eraser className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <a href={`/editor/${tweet}`}>
              <Button className="flex-auto" variant="default">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
