"use client";
import CharCounter from "@/components/charCounter";
import { ListOfTweets } from "@/components/listOfTweets";
import { useLocalStorage } from "@uidotdev/usehooks";
import { usePathname } from "next/navigation";
import { LocalTweets } from "@/components/types";

export default function Home() {
  const [tweets] = useLocalStorage<LocalTweets>("tweets", []);
  const pathname = usePathname();
  const tweetId = pathname.split("/").pop();

  return (
    <main className="flex min-h-screen flex-col gap-3 items-center md:pt-24 pt-10 pb-10">
      <h2 className="text-xl h-7">
        {(tweets.filter((tweet) => tweet.id === tweetId)[0]
          ?.displayName as string) ?? " "}
      </h2>
      <CharCounter />
      <ListOfTweets />
    </main>
  );
}
